const clearResults = () => {

    const results = document.getElementById("results");

    while (results.firstChild) {

        results.removeChild(results.firstChild);

    }

}

const search = () => {

    const region = document.getElementById("region").value;
    const genre = document.getElementById("genre").value;
    const searchTerm = document.getElementById("searchBox").value;

    fetch("/search", {

        headers: {

            "region": region,
            "genre": genre,
            "query": searchTerm

        }

    })
    .then(response => response.json())
    .then(data => {

        clearResults();

        const results = document.getElementById("results");

        data.forEach(title => {

            const row = document.createElement("tr");

            const name = document.createElement("td");
            const netflix = document.createElement("td");
            const hbo = document.createElement("td");
            const binge = document.createElement("td");
            const stan = document.createElement("td");
            const disney = document.createElement("td"); 

            name.textContent = title.name;
            netflix.textContent = title.netflix ? "✓" : "✗";
            hbo.textContent = title.hbo ? "✓" : "✗";
            binge.textContent = title.binge ? "✓" : "✗";
            stan.textContent = title.stan ? "✓" : "✗";
            disney.textContent = title.disney ? "✓" : "✗"; 

            row.appendChild(name);
            row.appendChild(netflix);
            row.appendChild(hbo);
            row.appendChild(binge);
            row.appendChild(stan);
            row.appendChild(disney);

            results.appendChild(row);

        });

    })
    .catch(error => {

        console.error(error);

        clearResults();

        const results = document.getElementById("results");
        results.textContent = "Error fetching search results";

    });

}

document.getElementById("searchBox").addEventListener("input", search);
document.getElementById("region").addEventListener("change", search);
document.getElementById("genre").addEventListener("change", search);

search();