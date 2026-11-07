
function ChatPanel({
  question, onQuestionChange, onSubmit, loading, answer, error, documentReady
}) {
  return (
    <section className='min-w-0 rounded-2xl border border-white/10 bg-[#101A2D]/45  p-5 shadow-lg'>
      <h2 className='mb-4 text-xl font-semibold'>Ask AI</h2>
      {!documentReady && (
        <p className="mb-3 text-sm text-gray-500">Upload and process a PDF first</p>
      )}
      <form onSubmit={onSubmit}>
        <label htmlFor='question' className='mb-2 block font-medium text-gray-700'>Your Question</label>
        <textarea
          id="question" value={question} onChange={onQuestionChange} placeholder='Ask something...' rows={4} className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500'
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
