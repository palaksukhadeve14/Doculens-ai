
function ChatPanel({
    question,onQuestionChange,onSubmit,loading,answer,error
}) {
  return (
   <section className='min-w-0 rounded-xl bg-white p-5 shadow-sm'>
          <h2 className='mb-4 text-xl font-semibold'>Ask AI</h2>

          <form onSubmit={onSubmit}>
            <label htmlFor='question' className='mb-2 block font-medium text-gray-700'>Your Question</label>
            <textarea
              id="question" value={question} onChange={onQuestionChange} placeholder='Ask something...' row={4} className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blur-500' />
            <p className='mt-2 text-sm text-gray-500'>Characters typed : {question.length}</p>
            <button type='submit' disabled={loading} className='mt-4 rounded-3xl bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700'>{loading ? 'Thinking...' : 'Ask AI'}</button>
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
        </section>
  )
}

export default ChatPanel
