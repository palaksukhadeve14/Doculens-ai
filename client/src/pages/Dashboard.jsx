import { useState } from 'react'
import Header from '../components/Header.jsx'
import '../App.css'
import PdfUploader from '../components/PdfUploader.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import API_URL from '../../../config/api.js'

async function parseJSONresponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  }
  catch {
    return null;
  }
}

function Dashboard() {
  const [question, setquestion] = useState('')
  const [messages, setMessages] = useState([]);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState('');
  const [selectedfile, setselectedfile] = useState(null);


  const [documentId, setdocumentId] = useState('');
  const [uploading, setuploading] = useState(false);
  const [uploadError, setuploadError] = useState('');

  function handleNewChat() {
    setquestion('');
    setMessages([]);
    seterror('');
    setselectedfile(null);
    setdocumentId('');
    setuploadError('');
  }

  function handlequestionchange(event) {
    setquestion(event.target.value)
  }

  function handlefileSelect(file) {
    setselectedfile(file);
    setdocumentId('');
    setMessages([]);
    seterror('');
    setuploadError('');
  }
  async function handleUpload() {
    if (!selectedfile) {
      setuploadError("Please select a PDF first");
      return;
    }
    const formdata = new FormData()
    formdata.append('pdf', selectedfile);
    setuploading(true);
    setdocumentId('');
    setuploadError('');
    setMessages([])
    try {
      console.log("Starting PDF upload...");
      const response = await fetch(`${API_URL}/api/upload-pdf`, {
        method: 'POST',
        credentials: 'include',
        body: formdata
      });
      const data = await parseJSONresponse(response);

      if (!response.ok) {
        throw new Error(data?.error || 'PDF upload failed')
      }
      if (!data) {
        throw new Error("Invalid respoonse received form server");
      }
      if (!data.documentId) {
        throw new Error("Upload response is missing document information");
      }
      setdocumentId(data.documentId)
      console.log("PDF uploaded Succesfully :", data);
    }
    catch (error) {
      setuploadError(error.message);
    }
    finally {
      setuploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!question.trim()) {
      seterror("Please enter a question");
      return;
    }
    if (!documentId) {
      seterror("Please upload and process the PDF first");
      return;
    }

    console.log("Question Submitted: ", question);

    setloading(true);
    const currentquestion = question.trim();
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: currentquestion
      }
    ]);
    setquestion('');
    seterror('');

    try {
      const response = await fetch(`${API_URL}/api/ask-pdf`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: currentquestion,
            documentId: documentId
          })
        }
      )
      const data = await parseJSONresponse(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate answer");
      }
      if (!data) {
        throw new Error("Invalid response received form the server")
      }
      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('The server returned an invalid answer');
      }
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.answer
        }
      ])
    } catch (error) {
      seterror(error.message)
    } finally {
      setloading(false);
    }
  }
  return (

    <div className='app-background p-4 text-white md:p-6 lg:h-screen lg:overflow-hidden'>
      <div className='blue-sphere' />
      <div className='relative z-10 mx-auto max-w-[1800px] lg:flex lg:h-full lg:flex-col'>
        <Header onNewChat={handleNewChat} busy={loading || uploading} />

        <main className="mt-3 grid  grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr] lg:min-h-0 lg:flex-1 lg:grid-rows-1">




          <ChatPanel
            question={question}
            onQuestionChange={handlequestionchange}
            onSubmit={handleSubmit}
            loading={loading}
            messages={messages}
            error={error}
            documentReady={!!documentId}
          />
          <PdfUploader selectedfile={selectedfile}
            onfileSelect={handlefileSelect}
            onUpload={handleUpload}
            uploading={uploading}
            documentId={documentId}
            uploadError={uploadError} />

        </main>
      </div>
    </div >
  )
}

export default Dashboard
