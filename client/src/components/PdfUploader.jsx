import { useState,useEffect } from "react";

  function PdfUploader({selectedfile,onfileSelect,onUpload,uploading,documentId,uploadError})
{
    
  const [pdfURL, setpdfURL] = useState('');

   useEffect(() => {
    if (!selectedfile) {
      setpdfURL('');
      return;
    }
    const url = URL.createObjectURL(selectedfile);
    setpdfURL(url);

    return () => {
      URL.revokeObjectURL(url);
    }
  }, [selectedfile])

  //file selection handler
  function handlefileselection(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const ispdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!ispdf) {
      alert('Please select a pdf file');
      event.target.value = '';
      onfileSelect(null);
      return;
    }
    onfileSelect(file);
  }
    return(
         <section className='min-w-0 rounded-2xl border border-white/10 bg-[#101A2D]/45  p-5 shadow-lg'>
          <h2 className='mb-4 text-xl font-semibold'>PDF Document</h2>

          <label
            htmlFor='pdf-upload'
            className='mb-2 block font-medium text-gray-700'>
            Choose a pdf
          </label>
          <input
            id='pdf-upload'
            type='file'
            accept=".pdf,application/pdf"
            onChange={handlefileselection}
            className='block w-full text-sm text-gray-600' />

          {selectedfile && (
            <p className='mt-2 wrap-break-words text-sm text-gray-600'>Selected file : {selectedfile.name}</p>
          )} 
          {selectedfile && (
            <button 
            type="button"
            onClick={onUpload}
            disabled={uploading || !!documentId}
            className="mt-4 rounded-3xl bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {uploading
              ?'Processing PDF...'
            :documentId
            ?'PDF Uploaded':'Upload PDF'}
            </button>
          )}
          {documentId && (
            <p className="text-sm text-green-700 mt-3">
              PDF uploaded and processed successfully
            </p>
          )}
          {
            uploadError && (
              <p className='mt-3 text-sm text-red-600'>
                {uploadError}
              </p>
            )
          }
          
            {selectedfile && pdfURL && (
              <div className='mt-5 h-150 w-full overflow-hidden rounded-lg border border-gray-300'>
                <iframe 
                src={pdfURL}
                title='pdf-preview'
                className='h-full w-full' />
          </div>
            )}
        </section>
    )
}
export default PdfUploader