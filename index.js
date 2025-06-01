const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessBtn = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");


let currentTab = userTab;

currentTab.classList.add("current-tab");

// Initially show grant access container for weather tab and hide others
grantAccessContainer.classList.add("active");
searchForm.classList.remove("active");
loadingScreen.classList.remove("active");
userInfoContainer.classList.remove("active");

function switchTab(clickedTab) {
  if (clickedTab !== currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (currentTab === searchTab) {
      searchForm.classList.add("active");
      grantAccessContainer.classList.remove("active");
      userInfoContainer.classList.remove("active");
      loadingScreen.classList.remove("active");
    } 
    
    else {
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      loadingScreen.classList.remove("active");
      checkSessionForCoords();
    }
  }
}

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

function checkSessionForCoords() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchWeatherByCoords(coordinates);
  }
}

async function fetchWeatherByCoords({ lat, lon }) {
  grantAccessContainer.classList.remove("active");
  userInfoContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (error) {
    loadingScreen.classList.remove("active");
    alert("Failed to fetch weather data for your location.");
  }
}

async function fetchWeatherByCity(city) {
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (data.cod === "404") {
      loadingScreen.classList.remove("active");
      alert("City not found! Please check the city name.");
      return;
    }

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } 
  
  catch (error) {
    loadingScreen.classList.remove("active");
    alert("Failed to fetch weather data for the city.");
  }
}

function renderWeatherInfo(weatherInfo) {
  const cityName = document.querySelector("[data-cityName]");
  const cityIcon = document.querySelector("[data-cityIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const clouds = document.querySelector("[data-clouds]");
  const humidity = document.querySelector("[data-humidity]");

  cityName.innerText = weatherInfo.name;
  cityIcon.src = `https://flagcdn.com/144x108/${weatherInfo.sys.country.toLowerCase()}.png`;
  cityIcon.alt = weatherInfo.sys.country;
  desc.innerText = weatherInfo.weather[0].description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo.weather[0].icon}.png`;
  weatherIcon.alt = weatherInfo.weather[0].description;
  temp.innerText = `${weatherInfo.main.temp} °C`;
  windspeed.innerText = `${weatherInfo.wind.speed} m/s`;
  humidity.innerText = `${weatherInfo.main.humidity} %`;
  clouds.innerText = `${weatherInfo.clouds.all} %`;
}

// Get location and fetch weather
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, () => {
      alert("Location access denied.");
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchWeatherByCoords(userCoordinates);
}

grantAccessBtn.addEventListener("click", getLocation);

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cityName = searchInput.value.trim();
  if (cityName === "") return;
  fetchWeatherByCity(cityName);
});
