export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Results for Trial {params.id}</h1>
    </div>
  )
}