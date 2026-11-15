import { useRef,useEffect } from "react"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatPanel({
  question, onQuestionChange, onSubmit, loading, messages, error, documentReady
})

 {
  const chatContainerRef = useRef(null);
  const questionInputRef=useRef(null);
  useEffect(()=>{
    const container = chatContainerRef.current;
    if(container)
    {
      container.scrollTop=container.scrollHeight;
    }
  },[messages]);
  useEffect(()=>{
    const textArea = questionInputRef.current;
    if(!textArea)
    {
      return;
    }
    textArea.style.height='auto'
    const maxHeight=110;
    textArea.style.height=`${Math.min(textArea.scrollHeight,maxHeight)}px`;
    textArea.style.overflowY=
    textArea.scrollHeight>maxHeight?'auto':'hidden';
  },[question])
  return (
    <section className='flex flex-col h-full min-h-0 min-w-0 rounded-2xl border border-white/10 bg-[#101A2D]/45  p-5 shadow-lg'>

      <h2 className='mb-4 text-xl font-semibold'>Ask AI</h2>
      <div
      ref={chatContainerRef}
       className="flex flex-col overflow-y-auto min-h-0 flex-1">
        {
          messages.map(message => {
            return (
              <div
                className={`mb-3 flex ${
                  message.role==='user'?'justify-end':'justify-start'}`}
                key={message.id}>
                  <div className={` max-w-[80%] min-w-0 rounded-2xl px-4 py-3 text-white  ${message.role==='user'?'bg-blue-600 whitespace-pre-wrap':'bg-[#263449]'}`}>
                  {message.role==='user'?(
                    message.content):(
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                        </div>
                    )}
                  </div>
                  </div>
            )
          })
        }
      </div>
      <div className="shrink-0">
      {!documentReady && (
        <p className="mb-3 text-sm text-gray-500">Upload and process a PDF first</p>
      )}
      <form onSubmit={onSubmit}>
        <label htmlFor='question' className='mb-2 block font-medium text-gray-700'>Your Question</label>
        <textarea
          id="question" value={question} onChange={onQuestionChange} ref={questionInputRef} row={1} placeholder='Ask something...'  className='w-full min-h-5 resize-none overflow-y-hidden rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500'
        />
        <button
          type='submit'
          disabled={!documentReady || loading}
          className='mt-4 rounded-3xl bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50'
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>
      <p className="mt-2 text-sm text-gray-500">Character typed :{question.length}</p>

      
      {error && (
        <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-4'>
          <h2 className='font-semibold text-red-700'>Something went wrong</h2>
          <p className='mt-1 text-red-600'>{error}</p>
        </div>
      )}
      </div>
    </section>
  )
}

export default ChatPanel
