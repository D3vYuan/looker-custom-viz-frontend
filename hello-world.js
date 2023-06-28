function loadCharts(){
    default_country="United States";
    loadCountryChart(country_url);

    loadSelectedCountryText(default_country);
    country_filter.value = default_country;
    loadCityChart(city_url, country_filter);   
}

removeChildElements = (d) => {
    while (d.firstChild){
        d.removeChild(d.firstChild);
    }
}

function loadSelectedCountryText(country){
    const country_selected_text = document.getElementById("country-selected-text");
    removeChildElements(country_selected_text);
    const text_element = document.createElement("div");
    text_element.textContent = country;
    text_element.style.fontSize = "50px";

    const tooltip = document.createElement("title");
    tooltip.textContent = `You have selected ${country}`;

    text_element.append(tooltip);  

    // const tooltip = document.createElement("div");
    // tooltip.textContent = "You have selected Taiwan";
    // tooltip.style.position = "absolute";
    // tooltip.style.zIndex = 1000;
    // tooltip.style.padding = "10px";
    // tooltip.style.background = "lightgray";
  
    // Set the position of the tooltip
    // tooltip.style.top = text_element.offsetTop + 10 + "px";
    // tooltip.style.left = text_element.offsetLeft + 10 + "px";
  
    // Append the tooltip to the div
    // text_element.appendChild(tooltip);  

    // Center the text in the element
    text_element.style.textAlign = "center";
    country_selected_text.append(text_element);    
}

chartRefresh = (evt) => {
    title_element = evt.target.querySelector("title");
    try {
        title_name = title_element.getAttribute("id").replaceAll("_", " ");
        console.log("mouse-click: ", title_name);

        loadSelectedCountryText(title_name);
        country_filter.value = title_name;
        loadCityChart(city_url, country_filter);   
    } catch (e) {
        if (e instanceof TypeError){
            console.log("mouse-click: element not type of SVGTitleElement");
        } else {
            console.log("mouse-click: ", e);
        }
    }    
}

countryMouseOut = (evt) => {
    title_element = evt.target.querySelector("title");
    try {
        title_name = title_element.getAttribute("id").replaceAll("_", " ");
        console.log("mouse-out: ", title_name);
    } catch (e) {
        if (e instanceof TypeError){
            console.log("mouse-out: element not type of SVGTitleElement");
        } else {
            console.log("mouse-out: ", e);
        }
    }    
}

function loadCountryChartSpinner(){
    const chart_pie_element = document.getElementById("country-pie-chart");
    removeChildElements(chart_pie_element);
    
    const chart_text_element = document.getElementById("country-selected-text");
    removeChildElements(chart_pie_element);

    spinner_element_pie = document.createElement("div");
    spinner_element_pie.className = "loader";

    spinner_element_text = document.createElement("div");
    spinner_element_text.className = "loader";

    chart_pie_element.append(spinner_element_pie);
    chart_text_element.append(spinner_element_text);
}

async function loadCountryChart(url) {
    loadCountryChartSpinner();

    response = await getLookData(url, {});
    look_data = await response.json(); 
    look_json = transformCountryJson(look_data["response"]);
    top_n_json = await extractTopItems(look_json, 10);
    look_chart = await plotPieChart(top_n_json);

    const country_pie_element = document.getElementById("country-pie-chart");
    removeChildElements(country_pie_element);
    country_pie_element.append(look_chart);

    // Add a mouse hover event listener
    // look_chart.addEventListener('mouseover', countryMouseOver);
    look_chart.addEventListener('click', chartRefresh);
    
    // Add a mouse out event listener
    look_chart.addEventListener('mouseout', countryMouseOut);
}

function loadCityChartSpinner(){
    const chart_bar_element = document.getElementById("city-bar-chart");
    removeChildElements(chart_bar_element);

    const city_tree_element = document.getElementById("city-tree-map");
    removeChildElements(city_tree_element);

    spinner_element_bar = document.createElement("div");
    spinner_element_bar.className = "loader";

    spinner_element_tree = document.createElement("div");
    spinner_element_tree.className = "loader";

    chart_bar_element.append(spinner_element_bar);
    city_tree_element.append(spinner_element_tree);
}

function loadCityBarChart(look_data){
    console.log("city-bar: ", look_data);
    look_json = transformCityJson(look_data);
    top_n_json = extractTopItems(look_json, 10);
    look_chart = plotBarChart(top_n_json);
    
    const chart_bar_element = document.getElementById("city-bar-chart");
    removeChildElements(chart_bar_element);
    chart_bar_element.append(look_chart);
}

function loadCityTreeMap(look_data){
    console.log("city-tree: ", look_data);
    look_json = transformTreeJson(look_data);
    top_n_json = extractTopItems(look_json, 10);
    look_chart = plotTreeMap(top_n_json);

    const city_tree_element = document.getElementById("city-tree-map");
    removeChildElements(city_tree_element);
    city_tree_element.append(look_chart);
}

function loadCityMarimekkoMap(look_data){
    console.log("city-marimekko: ", look_data);
    look_json = transformMarimekkoJson(look_data);
    top_n_json = extractTopItems(look_json, 10);
    look_chart = plotMarimekkoMap(top_n_json);

    const city_tree_element = document.getElementById("city-tree-map");
    removeChildElements(city_tree_element);
    city_tree_element.append(look_chart);
}

async function loadCityChart(url, filter) {
    loadCityChartSpinner();
    const response = await getLookData(url, filter);
    const look_data = await response.json();

    const look_response = look_data["response"];

    loadCityBarChart(look_response);
    loadCityTreeMap(look_response);
    // loadCityMarimekkoMap(look_response);
}

function getLookData(url, data){
    const headers = {'Content-Type':'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'POST,PATCH,OPTIONS'};
    
    // loadCityChartSpinner();
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: headers,
        });
}

parseTextToJson = (data) => {
    console.log("Transforming: ", data);
    data = data.replaceAll("'", '"');
    // handle case where the text has apostrophe (e.g 's)
    data = data.replaceAll('"s', "'s"); 
    json_data = JSON.parse(data);
    return json_data;
}

function transformCountryJson(data){
    const d3_json = [];
    json_data = parseTextToJson(data);
    total_sales = json_data.map(item => item.total_sales)
        .reduce((a, b) => a + b);

    json_data.map(item => {
        console.log("Processing: ", item);
        d3_json.push({
            "name": `${item["location"]}`,
            "value": item["total_sales"],
            "ratio": Math.round(item["total_sales"] / total_sales * 100)
        })
    });
    return d3_json;
}

function transformCityJson(data){
    const d3_json = [];
    json_data = parseTextToJson(data);
    json_data.map(item => {
        console.log("Processing: ", item);
        d3_json.push({
            "name": `${item["location"]} - ${item["city"]}`,
            "value": item["total_sales"]
        })
    });
    return d3_json;
}

function transformTreeJson(data){
    const d3_json = [];
    json_data = parseTextToJson(data);
    json_data.map(item => {
        console.log("Processing: ", item);
        d3_json.push({
            "name": item["location"] + " - " + item["city"],
            "size": item["total_sales"]
        })
    });
    return d3_json;
}

function transformMarimekkoJson(data){
    const d3_json = [];
    json_data = parseTextToJson(data);
    json_data.map(item => {
        console.log("Processing: ", item);
        d3_json.push({
            "x": item["location"],
            "y": item["city"],
            "value": item["total_sales"]
        })
    });
    return d3_json;
}

function extractTopItems(data, limit){
    function comparator(a, b){
        return a["total_sales"] - b["total_sales"];
    }

    data.sort(comparator);
    top_n_data = data.slice(0, limit);
    console.log("limit ", limit, " - ", top_n_data);
    return top_n_data
}

function plotTreeMap(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
    children, // if hierarchical data, given a d in data, returns its children
    zDomain, // array of values for the color scale
    stroke, // stroke for node rects
    strokeWidth, // stroke width for node rects
    strokeOpacity, // stroke opacity for node rects
    strokeLinejoin, // stroke line join for node rects
  } = {}){
    console.log("Tree Map: ", data);
    
    // if tabular data, given a d in data, returns a unique identifier (string)
    const id = Array.isArray(data) ? d => d.id : null; 

    // if tabular data, given a node d, returns its parent’s identifier
    const parentId = Array.isArray(data) ? d => d.parentId : null; 

    // how to sort nodes prior to layout
    const sort = (a, b) => d3.descending(a.value, b.value); 

    // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    // e.g., "flare/animate/Easing"
    const path = (d) => d.name.replace(/\./g, "/"); 

    // given a node d, returns a quantitative value (for area encoding; null for count)
    // size of each node (file); null for internal nodes (folders)
    const value = (d) => d?.size; 

    // given a leaf node d, returns a categorical value (for color encoding)
    // e.g., "animate" in "flare.animate.Easing"; for color
    const group = (d) => d.name.split(".")[1];

    // given a leaf node d, returns the name to display on the rectangle
    // given a leaf node d, returns its hover text
    const label = (d, n) => [...d.name.split(".").pop().split(/(?=[A-Z][a-z])/g), n.value.toLocaleString("en")].join("\n");
    
    // text to show on hover
    // const title = (d, n) => `${d.name}\n${n.value.toLocaleString("en")}`; 
    const title = (d, n) => `Sales in ${d.name} were ${n.value.toLocaleString("en")}`

    // treemap strategy
    const tile = d3.treemapBinary; 
    const margin = ({top: 0, right: 0, bottom: 0, left: 0});
    const padding = ({inner: 1, outer: 1, top: 1, right: 1, bottom: 1, left: 1});
    const round = true;
    // fill for node rects (if no group color encoding)
    const fill = "#ccc"; 
    // fill opacity for node rects
    const fillOpacity = group == null ? null : 0.6; 
    const width = 250;
    // const height = Math.min(width, 1000) - width / 2;
    const height = width / 2;

    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);

    // Compute the values of internal nodes by aggregating from the leaves.
    value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

    // Prior to sorting, if a group channel is specified, construct an ordinal color scale.
    const leaves = root.leaves();
    const G = group == null ? null : leaves.map(d => group(d.data, d));
    if (zDomain === undefined) zDomain = G;
    zDomain = new d3.InternSet(zDomain);
    // const color = group == null ? null : d3.scaleOrdinal(zDomain, colors);
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(data.map(d => d.size));

    // Compute labels and titles.
    const L = label == null ? null : leaves.map(d => label(d.data, d));
    const T = title === undefined ? L : title == null ? null : leaves.map(d => title(d.data, d));

    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);

    // Compute the treemap layout.
    d3.treemap()
        .tile(tile)
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        .paddingInner(padding.inner)
        .paddingTop(padding.top)
        .paddingRight(padding.right)
        .paddingBottom(padding.bottom)
        .paddingLeft(padding.left)
        .round(round)
        (root);

    const svg = d3.create("svg")
        .attr("viewBox", [-margin.left, -margin.top, width, height]);

    const node = svg.selectAll("a")
        .data(leaves)
        .join("a")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    node.append("rect")
        .attr("fill", color ? (d, i) => color(G[i]) : fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    if (T) {
        node.append("title").text((d, i) => T[i]);
    }

    if (L) {
        // A unique identifier for clip paths (to avoid conflicts).
        const uid = `O-${Math.random().toString(16).slice(2)}`;

        node.append("clip-paths")
            .attr("id", (d, i) => `${uid}-clip-${i}`)
            .append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);

        node.append("text")
            .selectAll("tspan")
            .data((d, i) => `${L[i]}`.split(/\n/g))
            .join("tspan")
                .attr("x", 3)
                .attr("y", (d, i, D) => `${(i === D.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
                .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
                .text(d => d);   
    }

    // return svg.node();
    return Object.assign(svg.node(), {scales: {color}});
}

function plotMarimekkoMap(data){
    console.log("Marimekko Map: ", data);

    const margin = ({top: 30, right: -1, bottom: -1, left: 1});
    const width = 150;
    const height = width * 1.5;

    treemap = (data) => d3.treemap()
        .round(true)
        .tile(d3.treemapSliceDice)
        .size([
            width - margin.left - margin.right, 
            height - margin.top - margin.bottom
        ])
    (d3.hierarchy(d3.group(data, d => d.x, d => d.y))
        .sum(d => d.value))
        .each(d => {
            d.x0 += margin.left;
            d.x1 += margin.left;
            d.y0 += margin.top;
            d.y1 += margin.top;
        })

    const root = treemap(data);
    console.log("descendants: ", root.descendants());

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    const node = svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    const column = node.filter(d => d.depth === 1);

    column.append("text")
        .attr("x", 3)
        .attr("y", "-1.7em")
        .style("font-weight", "bold")
        .text(d => d.data[0] + " - " + d.value.toLocaleString());

    column.append("line")
        .attr("x1", -0.5)
        .attr("x2", -0.5)
        .attr("y1", -30)
        .attr("y2", d => d.y1 - d.y0)
        .attr("stroke", "#000")

    const cell = node.filter(d => d.depth === 2);

    color = d3.scaleOrdinal(d3.schemeCategory10).domain(data.map(d => d.y))

    cell.append("rect")
        .attr("fill", d => color(d.data[0]))
        .attr("fill-opacity", (d, i) => d.value / d.parent.value)
        .attr("width", d => d.x1 - d.x0 - 1)
        .attr("height", d => d.y1 - d.y0 - 1)
        .append("title")
        .text((d) => `Sales in ${d.data[0]} were ${d.value.toLocaleString()}`);

    cell.append("text")
        .attr("x", 3)
        .attr("y", "1.1em")
        .text(d => d.data[0] + " - " + d.value.toLocaleString());

    return svg.node();
}

function plotPieChart(data){
    console.log("Plotting pie: ", data);

    const margin = ({top: 20, right: 20, bottom: 20, left: 20});
    const width = 150;
    const height = Math.min(width, 150) - width / 2;
    const radius = Math.min(width, height) / 2;

    // The arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.67) // This is the size of the donut hole
        .outerRadius(radius - 1);

    // Another arc that won't be drawn. Just for labels positioning
    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const pie = d3.pie()
        .padAngle(0.005)
        .sort(null)
        .value(d => d.value);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    // find median to better distribute the label compare to just using Math.PI
    const pieData = pie(data);
    const angleDifferenceData = pieData.map(data => data.endAngle - data.startAngle);
    angleDifferenceData.sort((a, b) => a - b);

    line_generator = (d) => {
        // 3 position line --/
        var posA = arc.centroid(d) // line insertion in the slice
        var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.85 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC];
    }

    label_data_filter = (d) => {
        console.log("d: ", (d.endAngle - d.startAngle), " - ", (d.endAngle - d.startAngle) >= 0.12);
        return (d.endAngle - d.startAngle) >= 0.12;
    }

    label_generator = (d) => {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.89 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return 'translate(' + pos + ')';
    }

    label_style_generator = (d) => {
        var anglediff = d.endAngle - d.startAngle;
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    }

    svg.selectAll("paths")
        .data(pie(data))
        .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
        .append("title")
        .attr('id', d => d.data.name.replaceAll(" ", "_"))
        .text((d) => `Sales in ${d.data.name} were ${d.data.value} (${d.data.ratio}%)`);

    filteredData = pie(data).filter(d => label_data_filter(d));
    console.log(filteredData);

    svg.selectAll('polylines')
        .data(filteredData)
        .enter()
        .append('polyline')
          .attr("stroke", "black")
          .style("fill", "none")
          .attr("stroke-width", 0.5)
          .attr('points', line_generator);

    svg.selectAll('labels')
        .data(filteredData)
        .enter()
        .append('text')
        .text(d => `${d.data.name} (${d.data.ratio}%)`)
        .attr('transform', label_generator)
        .style('text-anchor', label_style_generator);

    return svg.node();
}

function plotBarChart(data){
    console.log("Plotting bar: ", data);

    const margin = ({top: 20, right: 20, bottom: 20, left: 20});
    const height = 150;
    const width = 150;

    x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]);

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(3).tickSizeOuter(0));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSize(3))
        .call(g => g.select(".domain").remove());

    try {
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .call(zoom);

        const mouseover = (event, d) => {
            console.log("mouse-over: ", event, " -- ", d);
        };

        const mouseleave = (event, d) => {
            console.log("mouse-leave: ", event, " -- ", d);
        }

        const mousemove = (event, d) => {
            console.log("mouse-move: ", event, " -- ", d);
        };

        svg.append("g")
            .attr("class", "bars")
            .attr("fill", "steelblue")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", x.bandwidth())
            .append("title")
            .text((d) => `Sales in ${d.name} were ${d.value}`)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("mouseover", mouseover);

        svg.append("g")
            .attr("class", "x-axis")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        return svg.node();
    } catch (error) {
        console.log("Plotting: fails due to ", error);
    }

    function zoom(svg) {
        const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

        svg.call(d3.zoom()
            .scaleExtent([1, 5])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed));

        function zoomed(event) {
            x.range([margin.left, width - margin.right].map(d => event.transform.applyX(d)));
            svg.selectAll(".bars rect").attr("x", d => x(d.name)).attr("width", x.bandwidth());
            svg.selectAll(".x-axis").call(xAxis);
        }
    }
}

const endpoint_url = "<replace-with-your-backend-hostname>"
const endpoint_port = "<replace-with-your-backend-port>"
const country_look_id = "<replace-with-your-country-look-id>"
const city_look_id = "<replace-with-your-city-look-id>"
const country_url = `http://${endpoint_url}:${endpoint_port}/look/${country_look_id}/country`;
const city_url = `http://${endpoint_url}:${endpoint_port}/look/${city_look_id}/city`;
const country_filter = {
    "key": "all_sessions.country",
    "value": "United States"
};

window.onload = loadCharts();
