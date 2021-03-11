def filter(originalfile,newfilename):
  #Kept as shown to remove common labels and for ease of reading by programmer. Only common labels are removed, so some labels including punctuation may remain but their occurance rate is so low that this should not affect the model
  f = open(originalfile,"r")    
    text = f.read()
    text = text.replace("__label__: ", "")
    text = text.replace("__label__$ ", "")
    text = text.replace("__label__? ", "")
    text = text.replace("__label__{ ", "")
    text = text.replace("__label__} ", "")
    text =text.replace("__label__'' ", "")
    text =text.replace("__label__' ", "")
    text =text.replace("__label__, ", "")
    text =text.replace("__label__( ", "")
    text =text.replace("__label__) ", "")
    text = text.replace('__label__can ','')
    text = text.replace("__label__'s ",'')  
    text = text.replace('__label__using ','')
    text = text.replace('__label__not ','')
    text = text.replace('__label__how ','')
    text = text.replace('__label__-- ','')
    outf = open(newfilename,"w") 
    
        
    outf.write(text)
    f.close()
    outf.close()