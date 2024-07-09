import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { utils, writeFile } from "xlsx";
import os from "os";

const url =
  "https://www.ebay.com/sch/i.html?_from=R40&_trksid=p2510209.m570.l1311&_nkw=laptop+computers&_sacat=0";
const getData = async () => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Content-Type": "text/html",
      },
    });
    const $ = cheerio.load(response.data);
    const data = [];

    // Extract and log product details
    $(".s-item__wrapper").each((index, element) => {
      const title = $(element).find(".s-item__title").text().trim();
      const price = $(element).find(".s-item__price").text().trim();
      const shipping = $(element).find(".s-item__shipping").text().trim();
      const rating = $(element).find(".x-star-rating .clipped").text().trim();

      data.push([title, price, shipping, rating]);

      const ws = utils.aoa_to_sheet([
        ["Title", "Price", "Shipping", "Rating"],
        ...data,
      ]);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "eBay Data");

      const desktopPath = path.join(os.homedir(), "Desktop");
      const excelFilePath = path.join(desktopPath, "eBayData.xlsx");

      writeFile(wb, excelFilePath);
      console.log(
        "Excel file has been written and  saved in desktop  successfully."
      );
    });
  } catch (error) {
    console.error("Error fetching the page:", error);
  }
};

getData();

const currencyConverter = (priceString) => {
  // Assuming priceString is in USD format, convert it to INR
  const priceUSD = parseFloat(priceString.replace(/\$|,/g, ""));
  const priceINR = priceUSD * 83.49; // Example conversion rate, replace with actual rate
  return priceINR.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
};
