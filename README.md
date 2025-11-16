 1. Project Title
    Dynamic weather dashboard


 2. Description
  A sleek, responsive weather dashboard built with pure vanilla JavaScript. It transforms OpenWeather API data into a beautiful glassmorphism UI, complete with dynamic backgrounds, animated Skycons, and a detailed 5-day forecast.


 3. Live Demo Link
    https://dynamicweatherdashboardusingcloud.netlify.app/


 4. Screenshot
  <img width="1715" height="979" alt="w1" src="https://github.com/user-attachments/assets/0c703f7e-acdb-4ece-b644-1741a1d8e67c" />
  <img width="1814" height="900" alt="w2" src="https://github.com/user-attachments/assets/43f1ff89-16cc-423f-8e7f-8b2e433cf2bc" />
  <img width="1794" height="910" alt="w3" src="https://github.com/user-attachments/assets/eacb24af-b03b-46b5-b577-7f38b337f9da" />


 6. Core Features
  * Real-time Weather
  * Geolocation
  * 5-Day Forecast (with High/Low)
  * Dynamic Backgrounds
  * Unit Conversion (°C/°F)
  


 6. Technology Stack
* JavaScript (ES6+)
* HTML5
* CSS3 (Flexbox, Grid)
* OpenWeather API
* Skycons


 7. How to Run Locally
1.  Clone the repository.
2.  Get an API key from OpenWeather.
3.  Add the key to `script.js`.
4.  Open `index.html` in a browser.


 8. How it Works (Workflow)

           1. When You First Open the Page
          When you open `index.html`, the app wakes up. It reads the HTML for the layout, the CSS for the style, and the JavaScript for the brains. The JavaScript file attaches all the "click" listeners to the buttons, like setting up little tripwires, but it doesn't show any weather. It just waits for you to do something.
        
           2. When You Search for a City
                1.  You type "London" and hit the search button.
                2.  This triggers the "search" tripwire, which starts its job.
                3.  The app immediately **shows the loading spinner** and hides any old results.
                4.  It sends out **two "to-do" lists** to the OpenWeather company:
                      List 1: "What's the weather *right now* in London?"
                      List 2: "What's the forecast for the *next 5 days* in London?"
                5.  The app waits for **both** lists to be sent back.
        
        
         3. When the Weather Info Comes Back
              1.  The app gets the two completed lists (the JSON data) from OpenWeather.
              2.  It **hides the loading spinner**.
              3.  It reads the lists and starts **building the page**:
                  * It puts "London" in the city name spot.
                  * It puts the current temperature (like 15°C) on the screen.
                  * It changes the whole page background to a "sunny" picture.
                  * It draws the animated "sun" icon.
                  * It reads the 5-day list and creates the five little forecast cards, one by one.
              4.  Finally, it **fades in the new weather information** all at once.
        
        
         4. When You Click the °C / °F Toggle
              1.  You click the switch.
              2.  The app **does not** ask OpenWeather for new info. It already has the data.
              3.  It just looks at the 15°C it has stored, **does the math** to turn it into 59°F, and just updates the text on the page.
              4.  It does this for the main temperature and all five forecast cards instantly.
              
        
         5. What If You Search for a Fake City?
              1.  You type "FakeCity" and hit search.
              2.  The app shows the loading spinner and sends its two "to-do" lists.
              3.  OpenWeather gets the lists and sends back a reply: **"Sorry, I don't know a 'FakeCity'."**
              4.  The app sees this "Sorry" message.
              5.  It **hides the loading spinner** and shows the **red error message** on the screen instead of the weather.



9. API Security Note
     The API key is included in the frontend script for demonstration purposes. For a production app, this key should be hidden on a backend server or serverless function.
