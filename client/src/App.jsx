import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [question,setquestion]=useState('')
  const [answer,setanswer]=useState('')
  const [loading,setloading]=useState(false);
  const [error,seterror]=useState('')
  function handlequestionchange(event){
    setquestion(event.target.value)
  }
  async function handleSubmit(event){
    event.preventDefault();
    if(!question.trim()){
      return;
    }
    console.log("Question Submitted: ",question);
    setloading(true);
    setanswer('');
    seterror('');
    try {
      const response = fetch('http://localhost:3000/api/ask',
        {
          method:'POST',
          headers:{
            'Content-type':"application/json",
          },
          body: JSON.stringify({
            question: question.trim()
          })
        }
      )
      const data=await response.json();

      if(!response.ok)
      {
        throw new Error(data.error || "Failed to get and answer");
      }
      setanswer(data.answer || "No answer received")
    } catch (error) {
      seterror(error.message)
    }finally{
      setloading(false);
    }
  }
  return (
    
    <div className='min-h-screen bg-gray-100 p-8'>
     <div className='mx-auto max-w-2xl'>
      <h1 className='text-3xl font-bold text-center'>PDF AI ASSISTANT</h1>
      <p className='mt-3 text-gray-600 text-center'>Upload a PDF and ASK question about it</p>

      <div className='mt-8 rounded-xl bg-white shadow-sm p-6'>
        <form onSubmit={handleSubmit}>
        <label htmlFor='question' className='mb-2 block font-medium text-gray-700'>Your Question</label>
        <textarea 
        id="question" value={question} onChange={handlequestionchange} placeholder='Ask something...' row={4} className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blur-500' />
        <p className='mt-3 text-sm text-gray-500'>Characters typed : {question.length}</p>
        <button type='submit' disabled={loading} className='mt-4 rounded-3xl bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700'>{loading?'Thinking...':'Ask AI'}</button>
        </form>
        {answer && (
          <div className='mt-6 rounded-lg bg-gray-50 p-4'>
            <h2 className='mb-2 font-semibold text-gray-800'>
              AI response
            </h2>
            <p className='whitespace-pre-wrap text-gray-700'>
              {answer}
            </p>
             </div>
        )}
        {error && (
          <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-4'>
            <h2 className='font-semibold text-red-700'>Something went wrong</h2>
            <p className='mt-1 text-red-600'>{error}</p>
          </div>
        )}
     </div>
    </div>
    </div>
  )
}

export default App
