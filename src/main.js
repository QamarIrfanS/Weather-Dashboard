import './style.css'

let lastCity = "";


let currentTempCelsius = null;
let isFahrenheit = false;


localStorage.removeItem("recentCities");
document.addEventListener("DOMContentLoaded", () =>{
})


const API_KEY ="e800be45f85d8fa307986fde7cb45b40";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const forecastDiv = document.getElementById("forecast");
const indiaCitiesDropdown = document.getElementById("indiaCitiesDropdown");

searchBtn.addEventListener("click",() => {
getWeather(cityInput.value.trim())

});

// Fetch weather by city

async function getWeather(city) {

try{
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`)


if(!res.ok){
  throw new Error("city not found");

}

const data = await res.json();
showForecast(data);
} catch(error){
  alert(error.message);
}
}

// User's location weather

document.getElementById("currentLocationBtn").addEventListener("click", getCurrentLocation);

function getCurrentLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByLocation(lat,lon);
      },
      error => {
        alert("Location access denied");
      }
    );

  }else{
    alert("Geolocation not supported");
  }
}

async function getWeatherByLocation(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Weather not found");
    }
    
    showForecast(data);
    todaysWeather(data);
    

  } catch (error) {
    alert(error.message);
  }
}


// Dropdown for recently searched cities

const recentCitiesDropdown = document.getElementById("recentCitiesDropdown");


// Load recent cities from localStorage
document.addEventListener("DOMContentLoaded", () => {
  const storedCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  updateDropdown(storedCities);
});


function updateDropdown(cities) {
  recentCitiesDropdown.innerHTML = ""; // clear old items

  if (cities.length === 0) {
    recentCitiesDropdown.style.display = "none";
    return;
  }

  
  recentCitiesDropdown.style.display = "inline-block";

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}


function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Prevent duplicates
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());

  // Add new city at the top
  cities.unshift(city);

  // Keep only 5 recent searches
  if (cities.length > 5) cities = cities.slice(0, 5);
  

  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateDropdown(cities);
}


searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  getWeather(city);
  saveCity(city); // save searched city
});


recentCitiesDropdown.addEventListener("change", () => {
  const city = recentCitiesDropdown.value;
  if (city) {
    getWeather(city);
  }
});


// dropdown for selection
indiaCitiesDropdown.addEventListener("change", () => {
  const city = indiaCitiesDropdown.value;

  if (!city) return;

  cityInput.value = city; // optional (UI sync)
  lastCity = city;

  getWeather(city);   //  fetch immediately
  saveCity(city);
});



// 5 days Forecast UI
  function showForecast(data)
{

  forecastDiv.innerHTML = "";
  const daily = data.list.filter((item,index) => index % 8 === 0
  );
   daily.forEach((day) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl p-4 text-center backdrop-blur";
    card.innerHTML = `<p class="font-semibold">${new Date(day.dt * 1000).toDateString()}</p>
    <p>Temp:${Math.round(day.main.temp)}°C 🌡️</p>
    <p>Weather:${day.weather[0].description} ☁️</p>
    <p>Wind:${day.wind.speed}m/s 🌬️</p>
    <p>Humidity:${day.main.humidity}% 💧</p>`
    forecastDiv.appendChild(card);
})
  }

// Today's weather

function todaysWeather(data) {
const today = data.list[0]; // closest forecast to now
document.getElementById("heading").innerHTML = "Today's Weather In...";
document.getElementById("cityName").textContent = data.city.name;

currentTempCelsius = today.main.temp;
updateTodayTemp();
updateBackground(today.weather[0].main);


  document.getElementById("description").textContent =`Weather: ${today.weather[0].description} ☁️`;
  document.getElementById("humidity").textContent = `Humidity: ${today.main.humidity}% 💧`;
  document.getElementById("wind").textContent = `Wind: ${today.wind.speed} m/s 🌬️`;

  document.getElementById("currentWeather").classList.remove("hidden");

  const temperature = Math.round(today.main.temp);

if(temperature > 40){
  alert("Extremely heat warning 🔥! Stay hyderated.");
}
else if(temperature < 0){
  alert("Freezing temperature🥶! Stay warm.");
}

}


// celsius to ferenhit

const unitToggle = document.getElementById("unitToggle");

unitToggle.addEventListener("change", () => {
  isFahrenheit = unitToggle.checked;
  updateTodayTemp();
});

function updateTodayTemp() {
  if (currentTempCelsius === null) return;

  const tempElement = document.getElementById("temp");

  if (isFahrenheit) {
    const f = (currentTempCelsius * 9 / 5) + 32;
    tempElement.textContent = `Temp: ${Math.round(f)}°F 🌡️`;
  } else {
    tempElement.textContent = `Temp: ${Math.round(currentTempCelsius)}°C 🌡️`;
  }
}

// bg Image

function updateBackground(weatherMain) {
  const body = document.body;

  let bgImage = "/images/sunny.jpg";

  switch (weatherMain.toLowerCase()) {
    case "clear":
      bgImage = "/images/clear.jpg";
      break;
    case "clouds":
      bgImage = "/images/clouds.jpg";
      break;
    case "rain":
    case "drizzle":
      bgImage = "/images/rain.jpg";
      break;
    case "snow":
      bgImage = "/images/snow.jpg";
      break;
    case "mist":
    case "fog":
    case "haze":
      bgImage = "/images/mist.jpg";
      break;
  }

  body.style.backgroundImage = `url(${bgImage})`;
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
  body.style.transition = "background-image 0.5s ease-in-out";
}
