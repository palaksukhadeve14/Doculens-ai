import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import './App.css'
import PdfUploader from './components/PdfUploader.jsx'
import ChatPanel from './components/ChatPanel.jsx'

function App() {
  const [question, setquestion] = useState('')
  const [answer, setanswer] = useState('')
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState('');
  const [selectedfile,setselectedfile]=useState(null);

  function handlequestionchange(event) {
    setquestion(event.target.value)
  }

  function handlefileSelect(file)
  {
    setselectedfile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!question.trim()) {
      seterror("Please enter a question");
      return;
    }
    if(!selectedfile)
    {
      seterror("Please select a PDF first");
      return;
    }
    console.log("Question Submitted: ", question);

    const formdata = new FormData();
    formdata.append('pdf',selectedfile);
    formdata.append('question',question.trim());

    setloading(true);
    setanswer('');
    seterror('');
    
    try {
      const response = await fetch('http://localhost:3000/api/ask-pdf',
        {
          method: 'POST',
          body: formdata
        }
      )
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get and answer");
      }
      setanswer(data.answer || "No answer received")
    } catch (error) {
      seterror(error.message)
    } finally {
      setloading(false);
    }
  }
  return (

    <div className='min-h-screen bg-gray-100 p-4 md:p-8'>
      <div className='mx-auto max-w-8xl'>
        <Header />

        <div className="mt-8 grid w-full grid-cols-1 gap-6">

         <PdfUploader selectedfile={selectedfile} 
         onfileSelect={handlefileSelect} />

        <ChatPanel 
        question={question}
        onQuestionChange={handlequestionchange}
        onSubmit={handleSubmit}
        loading={loading}
        answer={answer}
        error={error}
        />
      </div>
    </div>
    </div >
  )
}

export default App
