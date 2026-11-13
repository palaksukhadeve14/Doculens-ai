import { useState} from 'react'
import Header from '../components/Header.jsx'
import '../App.css'
import PdfUploader from '../components/PdfUploader.jsx'
import ChatPanel from '../components/ChatPanel.jsx'

function Dashboard() {
  const [question, setquestion] = useState('')
  const [messages, setMessages] = useState([]);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState('');
  const [selectedfile,setselectedfile]=useState(null);


  const [documentId,setdocumentId]=useState('');
  const [uploading,setuploading]=useState(false);
  const [uploadError,setuploadError]=useState('');

  function handlequestionchange(event) {
    setquestion(event.target.value)
  }

  function handlefileSelect(file)
  {
    setselectedfile(file);
    setdocumentId('');
    setMessages([]);
    seterror('');
    setuploadError('');
  }
  async function handleUpload()
  {
    if(!selectedfile)
    {
      setuploadError("Please select a PDF first");
      return;
    }
    const formdata=new FormData()
    formdata.append('pdf',selectedfile);
     setuploading(true);
     setdocumentId('');
     setuploadError('');
     setMessages([])
     try{
      const response=await fetch("http://localhost:3000/api/upload-pdf",{
        method:'POST',
        credentials:'include',
        body:formdata
      });
      const data=await response.json();
      if(!response.ok)
      {
        throw new Error(data.error || 'PDF upload failed')
      }
      setdocumentId(data.documentId)
      console.log("PDF uploaded Succesfully :",data);
     }
     catch(error)
     {
      setuploadError(error.message);
     }
     finally{
      setuploading(false);
     }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!question.trim()) {
      seterror("Please enter a question");
      return;
    }
    if(!documentId)
    {
      seterror("Please upload and process the PDF first");
      return;
    }
    
    console.log("Question Submitted: ", question);

    setloading(true);
    const currentquestion = question.trim();
    setMessages(prevMessages=>[
      ...prevMessages,
      {
        id:crypto.randomUUID(),
        role:'user',
        content:currentquestion
      }
    ]);
    setquestion('');
    seterror('');
    
    try {
      const response = await fetch('http://localhost:3000/api/ask-pdf',
        {
          method: 'POST',
          credentials:'include',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            question:currentquestion,
            documentId:documentId
          })
        }
      )
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate answer");
      }
     setMessages(prevMessages=>[
      ...prevMessages,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || 'No answer received'
      }
     ])
    } catch (error) {
      seterror(error.message)
    } finally {
      setloading(false);
    }
  }
  return (

    <div className='app-background p-4 text-white md:p-6'>
      <div className='blue-sphere' />
      <div className='relative z-10 mx-auto max-w-[1800px]'>
        <Header />

        <main className="mt-6 grid  grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.4fr_1fr]">

<aside>
<h4>User history</h4>
</aside>
        

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
