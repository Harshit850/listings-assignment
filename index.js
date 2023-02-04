import axios from "axios";
import moment from "moment";
import fs from "fs";

import { GET_LISTINGS } from "./constants.js";

/**
 * @author Harshit Kumar
 * @param {*} response
 * @returns csv file
 */
function makeCSVFileOfListings(response) {
  // Write the header in CSV file
  const csvContent = `Listing ID,Headline,Start Date,End Date,Price\n`;
  if (response && response.data && response.data.listings) {
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
    csvContent = data.map(row => row.join(",")).join("\n");
  } else {
    console.log("The API response is undefined or NULL");
  }

  // create the CSV file
  fs.writeFileSync("listings.csv", csvContent);
}

/**
 * @author Harshit Kumar
 * @param {*} requestBody
 */
async function getListings(requestBody) {
  // Make the API request with the given address and page size
  const response = await axios.post(GET_LISTINGS, JSON.stringify(requestBody));
  makeCSVFileOfListings(response);
}

/**
 * @author Harshit Kumar
 * @param {*} address
 * @returns true if address is valid
 */
function validateAddress(address) {
  const addressRegex = new RegExp(/^[A-Za-z0-9 ]+$/);
  return addressRegex.test(address);
}

function main() {
  const requestBody = {
    q: "500 W Madison St Chicago IL 606079",
    pageSize: 50
  };

  if (validateAddress(requestBody.q)) {
    console.log("Address is Valid!, fetching data...");
    getListings(requestBody);
  } else {
    console.log("Address not Valid!");
  }
}

main();
