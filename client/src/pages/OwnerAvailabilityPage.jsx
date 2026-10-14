import TeamAvailabilityCalendar from '../components/availability/TeamAvailabilityCalendar.jsx';
// Titolare · stesso calendario, ma modificabile
export default function OwnerAvailabilityPage() {
  return <><h2>Disponibilità di tutti</h2>
    <p className="mute" style={{ marginTop: 0 }}>Solo il titolare può togliere una disponibilità confermata o far passare un'indisponibilità a disponibilità, anche a termine scaduto.</p>
    <TeamAvailabilityCalendar editable />
  </>;
}
