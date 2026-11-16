#  DocuLens AI

**DocuLens AI** is an AI-powered PDF assistant that allows users to upload PDF documents and ask questions about their content. It uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant information from uploaded documents and generate context-based answers using Google Gemini.

##  Features

- User registration and login with session-based authentication.
- Upload PDF documents and ask questions about their content.
- Extract text from PDFs and divide it into smaller chunks.
- Generate embeddings and perform semantic search.
- Retrieve relevant document information using Qdrant.
- Generate AI answers grounded in the uploaded PDF.
- View the uploaded PDF alongside the chat interface.

##  Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Vector Database | Qdrant Cloud |
| AI Integration | Google Gemini API |
| PDF Processing | PDFParse |
| File Upload | Multer |
| Deployment | Vercel, Render |

## 🤖 AI Models Used

| Model | Purpose |
|---|---|
| `gemini-embedding-001` | Generates vector embeddings for PDF chunks and user queries. |
| `gemini-3.8-flash` | Generates AI responses using retrieved document context. |

The embedding model converts text into vector representations for semantic search, while the generative model uses the retrieved context to answer user questions.

##  Architecture

### System Architecture

```text
                    USER
                     |
                     v
           +---------------------+
           |   React Frontend    |
           |  Vite + Tailwind CSS|
           +---------------------+
                     |
                REST APIs
                     |
                     v
           +---------------------+
           |   Express Backend   |
           |      Node.js        |
           +---------------------+
                /     |      \
               /      |       \
              v       v        v
        +---------+ +------+ +----------+
        | MongoDB | |Qdrant| |  Gemini  |
        |  Atlas  | |Cloud | |   API    |
        +---------+ +------+ +----------+
                     ^         ^
                     |         |
                 Embeddings  AI Response
                 & Retrieval Generation
                     |         |
                     +----+----+
                          |
                          v
                   React Frontend
                          |
                          v
                     USER ANSWER
```

### RAG Workflow

```text
          PDF UPLOAD
               |
               v
        Multer File Upload
               |
               v
        Extract PDF Text
          (PDFParse)
               |
               v
          Text Chunking
               |
               v
      Generate Embeddings
       (Gemini API)
               |
               v
       Store Vectors in
            Qdrant


         USER QUESTION
               |
               v
     Generate Query Embedding
               |
               v
        Search in Qdrant
               |
               v
     Retrieve Relevant Chunks
               |
               v
     Send Context + Question
          to Gemini API
               |
               v
       Generate AI Answer
               |
               v
        Display Answer
          to User
```

##  Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/palaksukhadeve14/Doculens-ai.git
```

### 2. Navigate to the Project

```bash
cd Doculens-ai
```

### 3. Install Backend Dependencies

```bash
npm install
```

### 4. Install Frontend Dependencies

```bash
cd client
npm install
```

### 5. Configure Environment Variables

Create the required environment files and configure MongoDB, session management, Qdrant, Gemini API, and the frontend API URL.

**Important:** Never commit `.env` files or expose API keys, database credentials, or session secrets. Keep environment files in `.gitignore` and configure production variables through the respective hosting platforms.

### 6. Run the Application

Open two terminals from the project root.

**Terminal 1 – Backend**

```bash
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd client
npm run dev
```

Open the local frontend URL displayed by Vite in your browser.

##  Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Main Database | MongoDB Atlas |
| Vector Database | Qdrant Cloud |
| AI Services | Google Gemini API |

The frontend is deployed on Vercel, while the Express backend is hosted on Render. MongoDB Atlas and Qdrant Cloud provide the database services, and the Gemini API handles embedding generation and AI responses.

Vercel rewrites `/api` requests to the Render backend, allowing the frontend to communicate with the backend through relative API routes in production.

##  Concepts I Learned

While building DocuLens AI, I learned how to develop a full-stack application using React, Node.js, and Express. I worked with REST APIs to connect the frontend and backend and used MongoDB with Mongoose to store and manage application data.

I implemented user authentication using **bcrypt** for password hashing, **Express sessions and cookies** to maintain login sessions, and middleware to protect routes and verify authenticated users.

For PDF uploads, I used **Multer** with memory storage to handle uploaded files on the backend, along with file size restrictions. I used **PDFParse** to extract text from PDF documents and learned how to process the extracted content into smaller overlapping chunks for better retrieval.

One of the major things I learned was implementing **Retrieval-Augmented Generation (RAG)** practically. I used Gemini embeddings to convert document chunks and user queries into vector representations. I stored these vectors in **Qdrant** and learned how to perform similarity search with metadata filters so that retrieved information belongs to the correct user and document.

I also integrated the **Google Gemini API** for embedding generation and AI response generation, where retrieved document context is used to generate answers relevant to the user's question.

Apart from AI integration, I gained experience in managing environment variables, connecting cloud services, configuring a same-origin API proxy using Vercel rewrites, and deploying a full-stack application using Vercel, Render, MongoDB Atlas, and Qdrant Cloud.

##  Future Improvements

- Implement a cleaner PDF viewer without the browser's default toolbar.
- Highlight PDF pages relevant to AI-generated answers.
- Improve mobile and tablet responsiveness.
