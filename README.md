# Decentralized Rental Agreement Blockchain System

A comprehensive, blockchain-powered platform for managing rental agreements, payments, and property listings with mathematical transparency and cryptographic security.

## 🌟 Project Overview

This project aims to revolutionize the traditional rental process by replacing paper-based contracts and manual payment tracking with **Smart Contracts** on the Ethereum blockchain. It provides a seamless interface for landlords to list properties and for tenants to browse, rent, and pay securely using cryptocurrency.

## 🏗️ Project Structure

The project is divided into three main components:

-   **/rental_agreement_dapp**: The heart of the system, containing Solidity smart contracts (Rental Agreement Factory and individual Agreement logic), Hardhat configuration, and deployment scripts.
-   **/rental_agreement_backend**: A robust Node.js/Express API that manages user authentication, property metadata, off-chain review storage, and serves as a bridge for supplementary data.
-   **/rental_agreement_frontend**: A modern, responsive React/TypeScript application built with Vite and Tailwind CSS, providing a premium user experience for both landlords and tenants.

---

## 🚀 Key Features

-   **📜 Smart Contract Agreements**: Self-executing rental contracts that handle deposit escrow, rent collection, and automated termination terms.
-   **💳 Secure Crypto Payments**: Built-in support for rent payments and security deposits via MetaMask (Ethers.js).
-   **🏢 Property Management**: Landlords can list properties with images, descriptions, and specific rental terms.
-   **🔍 Advanced Filtering**: Tenants can browse properties based on availability, type, and location.
-   **⚖️ Dispute Resolution**: Integrated on-chain dispute raising and resolution mechanisms.
-   **📄 PDF Generation**: Professional, automated generation of rental agreement certificates for legal reference.
-   **⭐ Rating & Review System**: Transparent feedback loop for property quality and landlord reliability.

---

## 🛠️ Technology Stack

| Component     | Technologies                                                                 |
| :------------ | :--------------------------------------------------------------------------- |
| **Blockchain** | Solidity, Hardhat, Ethers.js                                                 |
| **Frontend**   | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Lucide-React  |
| **Backend**    | Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary                        |
| **Design**     | Modern Dark/Light Mode, Glassmorphism, Responsive Grid                       |

---

## ⚙️ Getting Started

### Prerequisites

-   **Node.js**: v18 or later
-   **MongoDB**: A local instance or MongoDB Atlas URI
-   **MetaMask**: Browser extension for blockchain interactions
-   **Hardhat**: For local blockchain testing

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd blockchain_project
    ```

2.  **Setup the DApp (Contracts)**
    ```bash
    cd rental_agreement_dapp
    npm install
    # Configure .env with your private key and RPC URL
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network <your-network>
    ```

3.  **Setup the Backend**
    ```bash
    cd ../rental_agreement_backend
    npm install
    # Configure .env with MONGODB_URI, JWT_SECRET, and CLOUDINARY credentials
    npm run dev
    ```

4.  **Setup the Frontend**
    ```bash
    cd ../rental_agreement_frontend
    npm install
    # Configure .env with VITE_API_URL and VITE_CONTRACT_ADDRESS
    npm run dev
    ```

---

## 🔒 Environment Variables

Ensure you have `.env` files in each directory with the following keys:

### Backend (`/rental_agreement_backend/.env`)
- `PORT`: Server port
- `MONGODB_URI`: Connection string for MongoDB
- `JWT_SECRET`: Secret key for authentication
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image uploads

### DApp (`/rental_agreement_dapp/.env`)
- `PRIVATE_KEY`: Your wallet private key
- `RPC_URL`: Ethereum/Testnet RPC URL

### Frontend (`/rental_agreement_frontend/.env`)
- `VITE_API_URL`: URL of the backend API
- `VITE_CONTRACT_ADDRESS`: Address of the deployed RentalFactory contract

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any feature requests or bug reports.

## 📜 License

This project is licensed under the MIT License.
