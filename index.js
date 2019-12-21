// intialize
const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const generateHTML = require("./generateHTML");
const puppeteer = require('puppeteer');


async function init() {
    try {
        // prompt user for information
       const data = await inquirer.prompt([
            {
                type: "input",
                name: "username",
                message: "What is your GitHub username?"
            },
            {
                type: "list",
                name: "color",
                message: "What is your favorite color?",
                choices: [
                    "red",
                    "green",
                    "pink",
                    "blue"
                ]
            }
        ]);
        const { username, color } = data;
        console.log(data.color);

        // axios calls
        const queryUrl = `https://api.github.com/users/${username}`;
        const queryUrl2 = `https://api.github.com/users/${username}/starred`;
        const response = await axios.get(queryUrl);
        const userInfo = response.data;
        const gitStars = await axios.get(queryUrl2);
        const stars = gitStars.data[0].stargazers_count;

        // generate HTML
        const genHTML = generateHTML(data, userInfo, stars);
        const filename = `${userInfo.login}.html`;
        // create HTML file or else icons do not show on PDF.
        fs.writeFile(filename, genHTML, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log("HTML Complete!");
        });

        // generate pdf
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(genHTML);
        await page.pdf({path:`./pdf/${userInfo.login}.pdf`, format:'A4'});
        await browser.close();
        console.log("PDF has been created.");

    } catch (err) {
        console.log(err);
    }
}

init();