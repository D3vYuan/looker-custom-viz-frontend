<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h2 align="center">Looker Visualization</h2>
  <p align="center">
    Case Study - Looker Custom Vizualization
  </p>
  <!--div>
    <img src="images/profile_pic.png" alt="Logo" width="80" height="80">
  </div-->
</div>

---

<!-- TABLE OF CONTENTS -->

## Table of Contents

<!-- <details> -->
<ol>
    <li>
        <a href="#about-the-project">About The Project</a>
    </li>
    <li>
        <a href="#setup">Setup</a>
        <ul>
            <li><a href="#python-backend">Python Backend</a></li>
            <li><a href="#javascript-dependencies">Javascript Dependencies</a></li>
            <li><a href="#javascript-frontend">Javascript Frontend</a></li>
            <li><a href="#startup-script">Startup Script</a></li>
        </ul>
    </li>
    <li>
        <a href="#implementation">Implementation</a>
        <ul>
            <li><a href="#country-pie-chart">Country View Pie Chart</a></li>
            <li><a href="#city-bar-chart">City View Bar Chart</a></li>
            <li><a href="#city-tree-map">City View Tree Map</a></li>
        </ul>
    </li>
    <li><a href="#usage">Usage</a>
        <ul>
            <li><a href="#via-local-run">Via Local Run</a></li>
        </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
</ol>
<!-- </details> -->

---

<!-- ABOUT THE PROJECT -->

## About The Project

This project is created to showcase how we can create a custom visualization for `Looker` with data from `Looker API`.

The following are some of the requirements:

- Showcase the drilldown of visualization for `Looker`, in this case study we are drilling down from *Country* to *City*

`NOTE:` This repository is the frontend, while the other [repository][ref-looker-custom-viz-backend] is the backend.

<p align="right">(<a href="#top">back to top</a>)</p>

---

<!-- Setup -->

## Setup

Base on the requirements, the following components are required to be setup:

- `Python Backend` - The services to return the `Look` view data for the *frontend* to visualize it
- `Javascript Dependencies` - The dependencies required for the javascript to create the visualization
- `Javascript Frontend` - The application to visualize the data from the *backend* services
- `Startup Script` - The script to run the *frontend* application

<p align="right">(<a href="#top">back to top</a>)</p>

### Python Backend

Start up the `Python` *backend* services with the *start_http.sh* in the [backend][ref-looker-custom-viz-backend] repository.

| ![looker-api-backend-run][looker-api-backend-run] | 
|:--:| 
| *Looker API Backend Run* |

`NOTE: ` As the project is running *localhost*, additional network configuration (e.g firewall configuration, allow ports) might need to be taken care of if the *backend* and *frontend* are running in separate environment

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

### Javascript Dependencies

Add the `d3.js` and the custom javascript library for the javascript into *hello-world.html*

```html
<body>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="hello-world.js"></script>
</body>
```

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

### Javascript Frontend

Configure the fields *endpoint_url*, *endpoint_port*, *country_look_id*, *city_look_id* based on the setup done in the [backend][ref-looker-custom-viz-backend] in *hello-world.js*

```javascript
const endpoint_url = "<replace-with-your-backend-hostname>"
const endpoint_port = "<replace-with-your-backend-port>"
const country_look_id = "<replace-with-your-country-look-id>"
const city_look_id = "<replace-with-your-city-look-id>"
const country_url = `http://${endpoint_url}:${endpoint_port}/look/${country_look_id}/country`;
const city_url = `http://${endpoint_url}:${endpoint_port}/look/${city_look_id}/city`;
```

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

### Startup Script

We will be using the python native http server to serve the application endpoints. The following is the command to start:

```bash
python3 -m http.server --bind localhost 8080
```

`NOTE:` We will be saving the commands in the *start_http.sh* for ease of resue later

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Implementation

Base on the requirements, the following are the visualizations that can be created:

- `Country Pie Chart` - The visualization to display the data aggregated by *country*
- `City Bar Chart` - The visualization to display the data filter by *country* and aggregated by *city*
- `City Tree Map` - The visualization to display the data filter by *country* and aggregated by *city*

<p align="right">(<a href="#top">back to top</a>)</p>

### Country Pie Chart

In order to build the *country pie chart*, the following steps are required:
- `getLookData` - Fetch data from *backend* services
- `transformCountryJson` - Map the returned json to the format required for `d3.js`
- `extractTopItems` - Extract only the top **10** items sorted by the count
- `plotPieChart` - Generate the visualization for *country* data
- `refreshChart` - Update existing visualization with the new generated visualization
- `addEventListener` - Add the *click* action to refresh the *city* charts

```javascript
async function loadCountryChart(url) {
    loadCountryChartSpinner();

    response = await getLookData(url, {});
    look_data = await response.json(); 
    look_json = transformCountryJson(look_data["response"]);
    top_n_json = await extractTopItems(look_json, 10);
    look_chart = await plotPieChart(top_n_json);
    refreshChart("country-pie-chart", look_chart)

    look_chart.addEventListener('click', chartRefresh);
    look_chart.addEventListener('mouseout', countryMouseOut);
}
```

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

### City Bar Chart

In order to build the *city bar chart*, the following steps are required:
- `getLookData` - Fetch data from *backend* services
- `transformCityson` - Map the returned json to the format required for `d3.js`
- `extractTopItems` - Extract only the top **10** items sorted by the count
- `plotBarChart` - Generate the visualization for *city* data
- `refreshChart` - Update existing visualization with the new generated visualization

```javascript
async function loadCityChart(url, filter) {
    loadCityChartSpinner();
    const response = await getLookData(url, filter);
    const look_data = await response.json();

    const look_response = look_data["response"];

    loadCityBarChart(look_response);
    loadCityTreeMap(look_response);
}

function loadCityBarChart(look_data){
    look_json = transformCityJson(look_data);
    top_n_json = extractTopItems(look_json, 10);
    look_chart = plotBarChart(top_n_json);

    refreshChart("city-bar-chart", look_chart);
}
```

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

### City Tree Map

In order to build the *city tree map*, the following steps are required:
- `getLookData` - Fetch data from *backend* services
- `transformTreeJson` - Map the returned json to the format required for `d3.js`
- `extractTopItems` - Extract only the top **10** items sorted by the count
- `plotTreeMap` - Generate the visualization for *city* data
- `refreshChart` - Update existing visualization with the new generated visualization

```javascript
async function loadCityChart(url, filter) {
    loadCityChartSpinner();
    const response = await getLookData(url, filter);
    const look_data = await response.json();

    const look_response = look_data["response"];

    loadCityBarChart(look_response);
    loadCityTreeMap(look_response);
}

function loadCityTreeMap(look_data){
    look_json = transformTreeJson(look_data);
    top_n_json = extractTopItems(look_json, 10);
    look_chart = plotTreeMap(top_n_json);

    refreshChart("city-tree-map", look_chart);
}
```

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

---

<!-- USAGE EXAMPLES -->

## Usage

There are 1 mode to test out the implementation
- Running Locally by executing the *start_http.sh*

<p align="right">(<a href="#top">back to top</a>)</p>

### Via Local Run
The following are the execution steps to run the code locally:

- Execute the startup script *start_http.sh* <br/>
    ```bash
    bash start_http.sh
    ```

- Verify that the program is started successfully <br/>
    **Logs** <br/>

    | ![looker-api-frontend-run][looker-api-frontend-run] | 
    |:--:| 
    | *Looker API Frontend Run* |

- Verify that the program is running and return the respective visualizations <br/>
    **Country Pie Chart** <br/>

    | ![looker-api-country-pie-chart][looker-api-country-pie-chart] | 
    |:--:| 
    | *Country Pie Chart* |

    **City Bar Chart** <br/>

    | ![looker-api-city-bar-chart][looker-api-city-bar-chart] | 
    |:--:| 
    | *City Bar Chart* |

    **City Tree Map** <br/>

    | ![looker-api-city-tree-map][looker-api-city-tree-map] | 
    |:--:| 
    | *City Tree Map* |

<p align="right">(<a href="#top">back to top</a>)</p>

---
<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [D3.js Bar Chart][ref-d3js-zoomable-bar-chart]
- [D3.js Donut Chart][ref-d3js-donut-chart]
- [D3.js Marimekko Chart][ref-d3js-marimekko-chart]
- [D3.js Tree Map][ref-d3js-treemap]
- [Readme Template][template-resource]

<p align="right">(<a href="#top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->
[template-resource]: https://github.com/othneildrew/Best-README-Template/blob/master/README.md
[ref-looker-custom-viz-backend]: https://github.com/D3vYuan/looker-custom-viz-backend
[ref-d3js-zoomable-bar-chart]: https://observablehq.com/@d3/zoomable-bar-chart
[ref-d3js-donut-chart]: https://observablehq.com/@d3/donut-chart/2
[ref-d3js-marimekko-chart]: https://observablehq.com/@d3/marimekko-chart
[ref-d3js-treemap]: https://observablehq.com/@d3/treemap

[looker-api-backend-run]: ./images/looker-api-backend-run.png
[looker-api-frontend-run]: ./images/looker-api-frontend-run.png
[looker-api-country-pie-chart]: ./images/looker-api-country-pie-chart.png
[looker-api-city-bar-chart]: ./images/looker-api-city-bar-chart.png
[looker-api-city-tree-map]: ./images/looker-api-city-tree-map.png