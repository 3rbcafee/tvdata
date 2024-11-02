    const allowedDomains = ["3rbcafee.com", "laky-saydatii.blogspot.com"]; // Replace with your allowed domains

    const currentDomain = window.location.hostname;

    if (!allowedDomains.includes(currentDomain)) {
      console.error("Access denied: Unauthorized domain");
      document.getElementById("output").innerHTML = "Access denied.";
    } else {
      async function fetchData(channelID) {
        try {
          const response = await fetch(`https://3rbcafee.glitch.me/https://elcinema.com/tvguide/${channelID}/`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Fetch dates
          const dateElements = Array.from(doc.querySelectorAll(".columns.small-12 .dates"));
          const dates = dateElements.map(date => date.textContent.trim());

          // Fetch show names, avoiding "مفضل" and "ذكرني" buttons
          const shows = Array.from(doc.querySelectorAll(".columns.small-6.large-3 ul.no-margin li a")).filter(show => {
            return !show.classList.contains("action-button-off");
          }).slice(0, 5); // Limit to first 5 shows

          // Fetch show times only
          const showTimeElements = Array.from(doc.querySelectorAll(".columns.small-3.large-2 ul.unstyled.text-center li:first-child")).slice(0, 5); // Limit to first 5 times

          const outputDiv = document.getElementById("output");
          outputDiv.innerHTML = ""; // Clear previous output

          // Function to subtract 6 hours and convert to 12-hour format
          const convertTo12HourFormat = (time) => {
            let [hour, minutePart] = time.split(':');
            let [minute, period] = minutePart.split(' ');
            hour = parseInt(hour, 10) - 6;
            if (hour < 0) hour += 24;

            period = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12; // Convert hour to 12-hour format

            return `${hour}:${minute} ${period}`;
          };

          // Display only the first 5 shows and their times
          shows.forEach((show, index) => {
            const showName = show.textContent.trim();

            // Get the show time directly and adjust it
            let showTimeText = showTimeElements[index]?.textContent.trim() || "No time available";
            showTimeText = showTimeText.replace(/صباحًا|مساءً/i, '').trim(); // Remove صباحًا/مساءً
            showTimeText = convertTo12HourFormat(showTimeText);

            // Append each show's data to the output div
            outputDiv.innerHTML += `
              <div class="show-entry">
                <p class="show-name"><strong>${showName}</strong></p>
                <p class="show-time">Time: ${showTimeText}</p>
              </div>`;
          });

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }

      // Get the channel ID from the data attribute
      const channelID = document.getElementById("output").dataset.channelId;
      fetchData(channelID); // Fetch data for the specified channel ID
    }
