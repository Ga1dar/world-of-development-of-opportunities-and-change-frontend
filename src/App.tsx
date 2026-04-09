import { Route, Routes } from 'react-router-dom'
import { Header } from './components/header/Header.tsx'
import { Home } from './components/pages/Home.tsx'
import { Aboutus } from './components/pages/Aboutus.tsx'
import { Contacts } from './components/pages/Contacts.tsx'
import { Events } from './components/pages/Events.tsx'
import { Specialists } from './components/pages/Specialists.tsx'

function App() {
  

  return (
    <>      
      <div className='bg-[#F0E8F0] h-screen'>
        <Header />
        
        <Routes >
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/specialists" element={<Specialists />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </div>
    </>
  )
}

export default App
