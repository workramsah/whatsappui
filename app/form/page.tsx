import { Footer } from "../components/Footer";
import Formdata from "../components/Formdata";
import { Header } from "../components/Header";

export default function Page(){
    return(
        <>
       <div className="min-h-screen bg-white overflow-x-hidden mt-10">
     
    
      <Header/>

      <main className="h-min ">
        
      <Formdata/>
        
      </main>

      <Footer/>
    </div>
        </>
    )
}