import Piano from './Piano'

function App() {

  return (
    <section className="flex flex-col gap-6 items-center justify-center grow lg:gap-4.5 lg:px-5 lg:py-8 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Web Piano Simulator</h1>
        <p>Click the keys to play notes</p>
      </div>
      <Piano />
    </section>
  )
}

export default App
