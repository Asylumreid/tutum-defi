import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import KeyFeatures from '../components/KeyFeatures'
import HowItWorks from '../components/HowItWorks'
import Calculator from '../components/Calculator'
import SecurityFeatures from '../components/SecurityFeatures'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <KeyFeatures />
      <HowItWorks />
      <Calculator />
      <SecurityFeatures />
      <Footer />
    </main>
  )
}

