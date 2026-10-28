import { useState,useEffect } from "react";

function PdfUploader()
{
    const [selectedfile, setselectedfile] = useState(null);
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
      setselectedfile(null);
      return;
    }
    setselectedfile(file);
  }
    return(
         <section className='min-w-0 rounded-xl w-full  bg-white p-5 shadow-sm'>
          <h2 className='mb-4 text-xl font-semibold'>PDF Document</h2>

          <label
            htmlFor='pdf-upload'
            className='mb-2 block font-medium text-gray-700'>
            Choose a pdf
          </label>
          <input
            id='"pdf-upload'
            type='file'
            accept=".pdf,application/pdf"
            onChange={handlefileselection}
            className='block w-full text-sm text-gray-600' />

          {selectedfile && (
            <p className='mt-2 break-words text-sm text-gray-600'>Selected file : {selectedfile.name}</p>
          )}

          
            {selectedfile && pdfURL && (
              <div className='mt-5 h-[600px] w-full overfolw-hidden rounded-lg border border-gray-300'>
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