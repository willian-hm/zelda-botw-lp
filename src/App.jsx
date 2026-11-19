import { useEffect } from 'react'
import { useStore } from './lib/store'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import Toast from './components/Toast'
import SectionDivider from './components/SectionDivider'
import Hero from './sections/Hero'
import Story from './sections/Story'
import Guide from './sections/Guide'
import SheikahLab from './sections/SheikahLab'
import Characters from './sections/Characters'
import HyruleMap from './sections/HyruleMap'
import Footer from './sections/Footer'

export default function App() {
  const motion = useStore((s) => s.motion)

  useEffect(() => {
    document.documentElement.dataset.motion = motion
  }, [motion])

  return (
    <>
      <Navbar />
      <CustomCursor />
      <main id="conteudo-principal">
        <Hero />
        <Story />
        <SectionDivider variant="to-light" />
        <Guide />
        <SectionDivider variant="to-dark" />
        <SheikahLab />
        <SectionDivider variant="sheikah" />
        <Characters />
        <SectionDivider variant="to-parchment-map" />
        <HyruleMap />
      </main>
      <Footer />
      <Toast />
    </>
  )
}
