function WeeklyActivityChart({ days, maxDailyGames }) {
  return (
    <div className="surface weekly-activity">
      <p className="label">Completed games over 7 days</p>
      <div className="weekly-activity__bars">
        {days.map((day) => {
          const activeUnits = Math.round((day.count / maxDailyGames) * 12)

          return (
            <div className="weekly-activity__day" key={day.date}>
              <div className="weekly-activity__track">
                <p className="text-primary">{day.count}</p>
                <div aria-hidden="true" className="weekly-activity__bar">
                  {Array.from({ length: 12 }, (_, index) => (
                    <span
                      className={index >= 12 - activeUnits ? 'active' : ''}
                      key={index}
                    />
                  ))}
                </div>
              </div>
              <p className="cm-muted">{day.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklyActivityChart
