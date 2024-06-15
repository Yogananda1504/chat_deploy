### DevRooms: Real-Time Messaging Platform

**Description**

DevRooms is a real-time messaging platform enabling dynamic communication within designated rooms. Its key technologies are:

1.) **Frontend:** ReactJS for a responsive and interactive user interface

2.) **Backend:** ExpressJS for server-side logic and API handling

3.) **JSWT:** JsonWebtoken for the stateless management of the user authentication

4.) **Database:** MongoDB for flexible data storage

5.) **Real-time Communication:** Socket.IO for seamless, event-driven messaging

6.) **Scalability:**
 - i) Applied Horizontal Scaling on the server app to create multiple Server instances
 - ii) Configured Socket.io-Redis Adapter to support the **Pub/Sub** between the server instances
 - iii)Inactivity Management of users 
  

## Table of Contents

* [Installation](#installation)
* [Client Setup](#client-setup)
* [Server Setup](#server-setup)
* [Configuration](#configuration)
* [Additional Notes](#additional-notes)

---

## Installation

**Prerequisites**

* Node.js ([https://nodejs.org](https://nodejs.org))
* npm (included with Node.js installation)
* MongoDB ([https://www.mongodb.com/](https://www.mongodb.com/))

**Steps**

## **Clone the repository:**
   ```
   git clone https://github.com/Yogananda1504/chat_deploy.git```

## Client-side:
    ```bash
       cd client
       npm i
    ```
    
## Server-side:
    ```bash
       cd server
       npm i
    ```


### **Configure MongoDB:**
Please connect to your MongoDB database to support the connection between the backend and the Database

### **Configure Redis:** 
Install Redis cli and  Redis Insight for Windows and configure your cloud redis database for pub/sub mechanism in RedisInsight


## Run:

### Frontend-side:

1. Navigate to the client directory:
    ```bash
    cd client
    ```

2. Start the React development server:
    ```bash
    npm run dev
    ```

### Backend-side:

1. Navigate to the server directory:
    ```bash
    cd server
    ```

2. Start the Node.js server:
    ```bash
    npm run dev
    ```

     
     
    
       

