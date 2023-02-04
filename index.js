import axios from "axios";
import moment from "moment";
import fs from "fs";

async function getListings(params) {
  // Make the API request with the given address and page size
  const url = "https://www.vrbo.com/serp/g";
  const response = await axios.post(url, JSON.stringify(params));

  if (!response || !response.data || !response.data.listing) {
    console.log("The API response is undefined or NULL");
    // Write the header in CSV file
    const csvContent = `Listing ID,Headline,Start Date,End Date,Price\n`;
    fs.writeFileSync("listings.csv", csvContent);
    console.log(csvContent);
    return;
  }

  // Extract the relevant information from the response
  const listings = response.data.listings;
  const today = moment().format("YYYY-MM-DD");
  const data = [];
  listings.forEach(listing => {
    const { listingId, headline, rentNights } = listing;
    if (rentNights) {
      // Only include rent rates starting from today
      rentNights.forEach(rent => {
        if (moment(rent.startDate).isSameOrAfter(today)) {
          data.push([
            listingId,
            headline,
            rent.startDate,
            rent.endDate,
            rent.price
          ]);
        }
      });
    }
  });

  // Write the extracted data to a CSV file
  const csvContent =
    `Listing ID,Headline,Start Date,End Date,Price\n` +
    data.map(row => row.join(",")).join("\n");
  fs.writeFileSync("listings.csv", csvContent);
  console.log(csvContent);
}

function validateAddress(address) {
  const addressRegex = new RegExp(/^[A-Za-z0-9 ]+$/);
  return addressRegex.test(address);
}

function main() {
  const params = {
    q: "500 W Madison St Chicago IL 60607",
    pageSize: 50
  };

  if (!validateAddress(params.q)) {
    console.log("Address not Valid!");
    return;
  } else {
    console.log("Address is Valid!, fetching data...");
  }
  getListings(params);
}

main();
