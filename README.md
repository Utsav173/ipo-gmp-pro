# IPO GMP Pro

IPO GMP Pro is a web application designed to provide real-time updates on the Grey Market Premium (GMP) for Initial Public Offerings (IPOs). It delivers comprehensive data including estimated listing prices, IPO sizes, open and close dates, allotment information, and listing dates, helping traders and investors make informed decisions.

## Features

-   **Live GMP Data:** Provides up-to-date GMP data for active and upcoming IPOs in the Indian stock market.
-   **Detailed IPO Information:** Offers essential details such as IPO price, lot size, estimated listing date, IPO size, and more.
-   **Historical Data:** View and analyze trends from historical GMP information with up to the minute changes in live gmp.
-   **Responsive Design:** The app is fully responsive, ensuring seamless usage on both desktop and mobile devices.
-   **Sorting and Filtering:** Sort IPOs by different criteria and filter by IPO name.
-   **Data Caching:** Implements data caching with auto-refresh, enhancing performance by reducing the number of server requests.
-   **Statistical Overview:** Presents key stats such as the number of active and upcoming IPOs, and the average GMP, allowing users to keep track of the overall market movement
-   **Real-Time updates** Auto-refreshes the latest changes with 2 hours data caching and 5 minute auto-refresh

## Tech Stack

-   **Frontend:**
    -   React
    -   TypeScript
    -   Vite
    -   Tailwind CSS
    -   Radix UI for component building
    -   Framer Motion for animations
    -   React-responsive for mobile design
-   **Data Fetching:**
    -   Utilizes an external API (`https://gmp-extractor.khatriutsav63.workers.dev/`)

## Installation and Usage

1.  Clone the repository:

    ```bash
    git clone https://github.com/Utsav173/ipo-gmp-pro.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd ipo-gmp-pro
    ```

3.  Install dependencies:

    ```bash
    npm install
    ```

4.  Start the development server:

    ```bash
    npm run dev
    ```

5.  Open your browser and go to the address where your server is hosted (usually `http://localhost:5173`).

## Project Structure

```
ipo-gmp-pro/
├── src/
│   ├── assets/           # Assets such as images
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Common components used across views
│   │   ├── desktop/      # Components for the desktop view
│   │   │   └── index.tsx
│   │   ├── mobile/       # Components for the mobile view
│   │   │   └── index.tsx
│   │   └── ui/           # UI components, for the tailwind css components
│   ├── lib/              # Utility functions like date parsing, data sorting
│   │   └── utils.ts
│   ├── types.ts          # TypeScript types and interfaces
│   ├── main.tsx          # Main React app file
│   ├── App.tsx           # Main Component, logic is managed here
│   └── index.html        # HTML file where the application is rendered
├── public/               # Static assets
├── vite.config.ts        # Vite configuration file
├── package.json          # npm configuration file with scripts
├── tailwind.config.ts    # Tailwind Configuration
└── tsconfig.json         # Typescript Config File

```

##  Additional Information
- **Data Refresh**:
  The app fetches data at initial load, caches the data locally and is set to auto-refresh the data at an interval of 120 minutes(2 hours), however, the data from API is changed frequently hence the UI displays that new change in less than 5 minutes. If needed you can also manual force a refresh, which pulls fresh data.
-  **SEO**: The application has been build to be Search Engine Optimized. The app has metadata including, description, canonical urls, site verification tags etc for better discovery on the internet
-   **Performance:**
    - Data Caching: API is cached locally for optimal data usage.
    - Lazy loading components
    - Optimized useMemo logic.

##  Contributing

If you'd like to contribute to the project, feel free to fork the repository and submit a pull request with your changes.

## License

[MIT License](LICENSE)
