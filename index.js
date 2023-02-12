import axios from "axios";
import moment from "moment";
import fs from "fs";

import { GET_LISTINGS, HEADERS, REQUEST_BODY } from "./constants.js";

const args = process.argv;

/**
 * @author Harshit Kumar
 * @param {*} response
 * @returns csv file
 */
const makeCSVFileOfListings = listings => {
  if (!listings || listings.length === 0) {
    console.log("No data to write to the CSV file.");
    return;
  }

  // Write the header in CSV file
  let csvContent = `Listing ID,Headline,Start Date,End Date,Price\n`;

  // Extract the relevant information from the response
  const today = moment().format("YYYY-MM-DD");
  const data = [];
  listings.forEach(listing => {
    const { listingId, rateSummary } = listing;
    const { headline } = listing.propertyMetadata;
    const { perNight } = listing.prices;

    if (rateSummary && rateSummary.rentNights) {
      // Only include rent rates starting from today
      if (moment(rateSummary.beginDate).isSameOrAfter(today)) {
        data.push([
          listingId,
          headline,
          rateSummary.beginDate,
          rateSummary.endDate,
          perNight.amount
        ]);
      }
    }
  });
  // Write the extracted data to a CSV file
  csvContent += data.map(row => row.join(",")).join("\n");

  fs.writeFileSync("listings.csv", csvContent);
  console.log(`Data written to the CSV file: listings.csv`);
};

/**
 * @author Harshit Kumar
 * @param {*} requestBody
 */
async function getListings(requestBody) {
  // Make the API request with the given address and page size
  try {
    const response = await axios.post(GET_LISTINGS, requestBody, {
      headers: HEADERS
    });

    const listings =
      response.data &&
      response.data.data &&
      response.data.data.results &&
      response.data.data.results.listings;

    makeCSVFileOfListings(listings);
  } catch (error) {
    console.error(`Error making API request: ${error.message}`);
  }
}

/**
 * @author Harshit Kumar
 * @param {*} address
 * @returns true if address is valid
 */
const validateAddress = address => {
  const addressRegex = new RegExp(/^[A-Za-z0-9- ]+$/);
  return addressRegex.test(address);
};

const main = () => {
  // get the request body
  let requestBody = REQUEST_BODY;

  // read the parameters and assign the value to request body
  const address = args[2] || requestBody.variables.request.q;
  const pageSize = args[3] || requestBody.variables.request.paging.pageSize;
  requestBody.variables.request.paging.pageSize = parseInt(pageSize);
  requestBody.variables.request.q = address;

  // validate address
  if (validateAddress(requestBody.variables.request.q)) {
    console.log("Address is Valid!, fetching data...");
    getListings(requestBody);
  } else {
    console.log("Address not Valid!");
  }
};

main();
