import fetch from "node-fetch";

export const searchCities = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      query
    )}&type=city&format=json&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    

    // Filter only city-level results
    const cities = data.results
      .filter(
        (item) =>
          ["city", "town", "village", "county", "postcode"].includes(item.result_type) &&
          item.city // must have a city name
      )
      .map((item) => ({
        name: item.city || item.address_line1 || item.formatted,
        state: item.state,
        country: item.country,
        lat: item.lat,
        lon: item.lon,
      }));

    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch city data" });
  }
};
