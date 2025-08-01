# Wise Fitness Landing Pages

This repository hosts the static front-end for the **Wise Fitness** final year project. The HTML files provide a simple landing page along with login, signup and various management pages for administrators and business users. Firebase is used for authentication and dynamic content such as testimonials and landing page text.

## Project Purpose

The pages showcase the features of the Wise Fitness application, allowing users to explore services, view subscription options and register for an account. Administrators and business users can manage content through dedicated dashboard pages.

## Setup

1. Clone this repository.
2. Serve the `FYP Websites` directory with any static web server. For example:
   ```bash
   cd "FYP Websites"
   python3 -m http.server
   ```
   Then open <http://localhost:8000/index.html> in your browser.
3. Update the Firebase configuration found in the HTML files if you wish to connect to your own backend.

The repository also includes a simple `render.yaml` which can be used to deploy the site to [Render](https://render.com).

## Usage

Open `index.html` to see the landing page and navigate between the different pages using the provided links. Make sure you have configured Firebase credentials if you want to try the login and management features.
