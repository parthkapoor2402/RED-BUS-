import { useMemo, useState } from 'react'
import {
  ALL_BUSES,
  DEMO_DATE,
  DEMO_NOW,
  ROUTE,
  busesForMode,
  fareDelta,
  freeChangeUntil,
  srpBanner,
  type Bus,
  type Ticket,
} from './data'
import './App.css'

type Screen =
  | 'home'
  | 'srp'
  | 'seat'
  | 'pay'
  | 'thanks'
  | 'shift'
  | 'cancel'
  | 'shifted'

type SrpMode = 'soon' | 'all'

function StatusBar({ time = DEMO_NOW }: { time?: string }) {
  return (
    <div className="sb">
      <span>{time}</span>
      <span>5G · ▓▓▓</span>
    </div>
  )
}

function BottomNav({ active = 'home' }: { active?: 'home' | 'bookings' }) {
  return (
    <nav className="navb">
      <div className={active === 'home' ? 'on' : ''}>
        <span className="ic">⌂</span>Home
      </div>
      <div className={active === 'bookings' ? 'on' : ''}>
        <span className="ic">☰</span>Bookings
      </div>
      <div>
        <span className="ic">?</span>Help
      </div>
      <div>
        <span className="ic">☺</span>Account
      </div>
    </nav>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [srpMode, setSrpMode] = useState<SrpMode>('soon')
  const [selected, setSelected] = useState<Bus | null>(null)
  const [seat, setSeat] = useState(3)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const paidTotal = selected ? selected.price + 15 : 0
  const listedBuses = useMemo(() => busesForMode(srpMode), [srpMode])

  const laterBuses = useMemo(() => {
    if (!ticket) return []
    return ALL_BUSES.filter((b) => b.id !== ticket.bus.id && b.dep > ticket.bus.dep)
  }, [ticket])

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  function book() {
    if (!selected) return
    const t: Ticket = {
      pnr: 'RB8F2K91',
      bus: selected,
      seat,
      paid: paidTotal,
      boarding: 'Madiwala',
      freeUntil: freeChangeUntil(selected.dep),
    }
    setTicket(t)
    setScreen('thanks')
  }

  function doShift(next: Bus) {
    if (!ticket) return
    const delta = fareDelta(ticket.bus.price, next.price)
    const nextTicket: Ticket = {
      ...ticket,
      bus: next,
      seat: Math.max(1, Math.min(12, seat + 1)),
      paid: next.price + 15,
      freeUntil: freeChangeUntil(next.dep),
      pnr: 'RB8F2K92',
    }
    setTicket(nextTicket)
    setSelected(next)
    setScreen('shifted')
    if (delta.kind === 'pay') flash(`Paid ₹${delta.amount} fare difference`)
    else if (delta.kind === 'refund') flash(`₹${Math.abs(delta.amount)} refunded to original payment`)
    else flash('Shifted · same fare')
  }

  function doCancel() {
    setScreen('cancel')
  }

  function confirmCancel() {
    flash(`₹${ticket?.bus.price ?? 0} fare refunded · fee kept`)
    setTicket(null)
    setSelected(null)
    setScreen('home')
  }

  return (
    <div className="stage">
      <header className="stage-head">
        <div className="brand">redBus · Departing Soon</div>
        <p className="tagline">
          Interactive MVP · Shift keeps the trip · Cancel refunds the fare
        </p>
      </header>

      <div className="phone-wrap">
        <div className="phone">
          <div className="notch" aria-hidden />
          <div className={`screen screen-${screen}`} key={screen}>
            {screen === 'home' && (
              <>
                <StatusBar time="9:05" />
                <div className="tabs">
                  <div className="on">
                    <div className="ic">🚌</div>Bus Tickets
                  </div>
                  <div>
                    <div className="ic">🚐</div>Cab/Bus Rental
                  </div>
                  <div>
                    <div className="ic">🚆</div>Train Tickets
                  </div>
                </div>
                <div className="body">
                  <div className="search-card">
                    <div className="sf">
                      <div className="k">FROM</div>
                      <div className="v">{ROUTE.from}</div>
                    </div>
                    <div className="sf">
                      <div className="k">TO</div>
                      <div className="v">{ROUTE.to}</div>
                    </div>
                    <div className="sf">
                      <div className="k">DATE</div>
                      <div className="v">{DEMO_DATE}</div>
                      <div className="date-chips">
                        <span className="on">TODAY</span>
                        <span className="off">TOMORROW</span>
                      </div>
                    </div>
                    <div className="pad">
                      <button className="btn" type="button" onClick={() => setScreen('srp')}>
                        SEARCH BUSES
                      </button>
                    </div>
                  </div>
                  <div className="offer-title">OFFERS</div>
                  <div className="offer">Same-day short routes · free change till T−60</div>
                </div>
                <BottomNav active="home" />
              </>
            )}

            {screen === 'srp' && (
              <>
                <div className="hdr">
                  <button className="back" type="button" onClick={() => setScreen('home')} aria-label="Back">
                    ‹
                  </button>
                  <div>
                    <div className="h1">
                      {ROUTE.from} → {ROUTE.to}
                    </div>
                    <div className="h2">
                      {DEMO_DATE} · {ROUTE.km} km
                    </div>
                  </div>
                </div>
                <div className="body scroll">
                  <div className="chiprow" role="tablist" aria-label="Results mode">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={srpMode === 'soon'}
                      className={`chip ${srpMode === 'soon' ? 'on' : ''}`}
                      onClick={() => setSrpMode('soon')}
                    >
                      Departing Soon
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={srpMode === 'all'}
                      className={`chip ${srpMode === 'all' ? 'on' : ''}`}
                      onClick={() => setSrpMode('all')}
                    >
                      All buses
                    </button>
                  </div>
                  <div className="banner">{srpBanner(srpMode)}</div>
                  {listedBuses.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`card tap ${b.departingSoon ? 'ds' : 'regular'}`}
                      onClick={() => {
                        setSelected(b)
                        setScreen('seat')
                      }}
                    >
                      <div className="times">
                        <div>
                          <div className="tbig">{b.dep}</div>
                          <div className="tsub">
                            {b.departingSoon ? `Leaves in ${b.leavesIn}` : `Departs ${b.dep}`}
                          </div>
                        </div>
                        <div className="tdur">{b.duration}</div>
                        <div className="tright">
                          <div className="tbig">{b.arr}</div>
                          <div className="price">₹{b.price}</div>
                        </div>
                      </div>
                      <div className="meta">
                        {b.seats} seats · {b.operator}
                        <br />
                        {b.type} · ★ {b.rating}
                      </div>
                      <div className="tags">
                        {b.departingSoon ? (
                          <>
                            <span className="tag">Free change till {freeChangeUntil(b.dep)}</span>
                            <span className="tag b">Confirmed seat</span>
                          </>
                        ) : (
                          <>
                            <span className="tag muted">Standard cancel</span>
                            <span className="tag b">Confirmed seat</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="foot">
                  <span className="chip">AC</span>
                  <span className="chip">SEATER</span>
                  <button className="btn" type="button">
                    SORT & FILTER
                  </button>
                </div>
              </>
            )}

            {screen === 'seat' && selected && (
              <>
                <div className="hdr">
                  <button className="back" type="button" onClick={() => setScreen('srp')} aria-label="Back">
                    ‹
                  </button>
                  <div>
                    <div className="h1">{selected.operator}</div>
                    <div className="h2">
                      {selected.dep} · Today · {ROUTE.from} → {ROUTE.to}
                    </div>
                  </div>
                </div>
                <div className="body">
                  <div className="chiprow">
                    <span className="chip on">All prices</span>
                    <span className="chip">₹{selected.price}</span>
                  </div>
                  <div className="seat-wrap">
                    <div className="driver">🚗</div>
                    <div className="seat-grid">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
                        const taken = [1, 2, 6, 11].includes(n)
                        const on = seat === n
                        return (
                          <button
                            key={n}
                            type="button"
                            disabled={taken}
                            className={`seat ${taken ? 'x' : ''} ${on ? 's' : ''}`}
                            onClick={() => setSeat(n)}
                          >
                            {on ? n : ''}
                          </button>
                        )
                      })}
                    </div>
                    {selected.departingSoon ? (
                      <div className="shift-promise" role="status">
                        <div className="shift-promise-k">Free shift if plans slip</div>
                        <div className="shift-promise-v">
                          Seat locked on this bus · change free till{' '}
                          <strong>{freeChangeUntil(selected.dep)}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="shift-promise standard" role="status">
                        <div className="shift-promise-k">Standard ticket</div>
                        <div className="shift-promise-v">
                          Normal cancel rules apply · no Departing Soon free shift
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="foot stack">
                  <div className="seat-sum">
                    <span>
                      1 seat | {seat}
                    </span>
                    <span>₹{selected.price}</span>
                  </div>
                  <button className="btn" type="button" onClick={() => setScreen('pay')}>
                    SELECT BOARDING & DROPPING POINTS
                  </button>
                </div>
              </>
            )}

            {screen === 'pay' && selected && (
              <>
                <div className="hdr">
                  <button className="back" type="button" onClick={() => setScreen('seat')} aria-label="Back">
                    ‹
                  </button>
                  <div>
                    <div className="h1">Complete your booking</div>
                    <div className="h2">00:09:42 left</div>
                  </div>
                </div>
                <div className="body">
                  <div className="pay-title">
                    {ROUTE.from} → {ROUTE.to}
                  </div>
                  <div className="pay-sub">
                    {selected.operator} · Seat {seat} · {selected.dep}
                  </div>
                  <div className="pay-row">
                    <span>Pay</span>
                    <span className="amt">₹{paidTotal.toFixed(2)}</span>
                  </div>
                  <div className="sec">PREFERRED PAYMENT</div>
                  <button className="pay-method" type="button" onClick={book}>
                    PhonePe UPI
                  </button>
                  <button className="pay-method" type="button" onClick={book}>
                    Google Pay
                  </button>
                  <button className="pay-method" type="button" onClick={book}>
                    Paytm
                  </button>
                  <div className="okbox">
                    <strong>Free shift</strong> to another departing bus till{' '}
                    <strong>{freeChangeUntil(selected.dep)}</strong>. Fare difference only if the
                    next bus costs more. Cancel stays available as fallback.
                  </div>
                </div>
              </>
            )}

            {screen === 'thanks' && ticket && (
              <>
                <StatusBar />
                <div className="ty">
                  <div className="check" aria-hidden>
                    <i />
                  </div>
                  <h3>Booking confirmed</h3>
                  <div className="pnr">
                    Seat <strong>{ticket.seat}</strong> · {ticket.bus.operator}
                    <br />
                    {ticket.bus.dep} · {ticket.boarding}
                    <br />
                    PNR {ticket.pnr}
                  </div>
                  {ticket.bus.departingSoon ? (
                    <div className="countdown">
                      <div className="k">Free change window</div>
                      <div className="v">Till {ticket.freeUntil} · 12 min left</div>
                      <div className="s">Still going? Shift. Not going? Cancel for refund.</div>
                    </div>
                  ) : (
                    <div className="countdown standard-note">
                      <div className="k">Standard cancel</div>
                      <div className="v">Operator cancel rules apply</div>
                      <div className="s">
                        Free shift is only on Departing Soon buses. Book earlier next time for that
                        flexibility.
                      </div>
                    </div>
                  )}
                  <div className="ty-actions">
                    {ticket.bus.departingSoon ? (
                      <div className="btn-row">
                        <button className="btn shift" type="button" onClick={() => setScreen('shift')}>
                          SHIFT BUS
                        </button>
                        <button className="btn cancel" type="button" onClick={doCancel}>
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button className="btn cancel" type="button" onClick={doCancel}>
                        CANCEL TICKET
                      </button>
                    )}
                    <button
                      className="btn ghost"
                      type="button"
                      style={{ marginTop: 8 }}
                      onClick={() => flash('Ticket saved in Bookings')}
                    >
                      VIEW TICKET
                    </button>
                  </div>
                </div>
                <BottomNav active="bookings" />
              </>
            )}

            {screen === 'shift' && ticket && (
              <>
                <div className="hdr teal">
                  <button className="back" type="button" onClick={() => setScreen('thanks')} aria-label="Back">
                    ‹
                  </button>
                  <div>
                    <div className="h1">Shift your trip</div>
                    <div className="h2">1 free shift · same route · today</div>
                  </div>
                </div>
                <div className="body scroll">
                  <div className="current">
                    Current: <strong>
                      {ticket.bus.operator.split(' ')[0]} {ticket.bus.dep} · Seat {ticket.seat}
                    </strong>
                    <br />
                    Free change till {ticket.freeUntil} · releasing this seat
                  </div>
                  <div className="shift-prompt">
                    {laterBuses.length} buses leave in the next 2 hours
                  </div>
                  {laterBuses.map((b) => {
                    const d = fareDelta(ticket.bus.price, b.price)
                    return (
                      <div key={b.id} className="card">
                        <div className="times">
                          <div>
                            <div className="tbig">{b.dep}</div>
                            <div className="tsub">Leaves in {b.leavesIn}</div>
                          </div>
                          <div className="tdur">{b.duration}</div>
                          <div className="tright">
                            <div className="tbig">{b.arr}</div>
                            <div className="price">₹{b.price}</div>
                          </div>
                        </div>
                        <div className="meta">
                          {b.operator} · {b.seats} seats · ★ {b.rating}
                        </div>
                        <div className="shift-row">
                          <span className={`delta ${d.kind === 'pay' ? 'up' : ''}`}>{d.label}</span>
                          <button className="btn shift sm" type="button" onClick={() => doShift(b)}>
                            SHIFT HERE
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="foot stack">
                  <button className="btn cancel" type="button" onClick={doCancel}>
                    CANCEL TICKET · GET REFUND
                  </button>
                  <div className="quiet">Shift keeps your trip · Cancel ends it</div>
                </div>
              </>
            )}

            {screen === 'cancel' && ticket && (
              <>
                <div className="hdr">
                  <button
                    className="back"
                    type="button"
                    onClick={() => setScreen('thanks')}
                    aria-label="Back"
                  >
                    ‹
                  </button>
                  <div>
                    <div className="h1">Cancel ticket</div>
                    <div className="h2">Free refund window till {ticket.freeUntil}</div>
                  </div>
                </div>
                <div className="body">
                  <div className="cancel-box">
                    <p>
                      You’re about to end this trip. We’ll refund <strong>₹{ticket.bus.price}</strong>{' '}
                      fare to your original payment. Convenience fee is kept.
                    </p>
                    <p className="muted">
                      Still need to go? Prefer <strong>Shift</strong> — fare difference only, trip
                      stays alive.
                    </p>
                  </div>
                  <div className="okbox soft">
                    {laterBuses.length} buses leave in the next 2 hours — you can shift instead.
                  </div>
                </div>
                <div className="foot stack">
                  <button className="btn shift" type="button" onClick={() => setScreen('shift')}>
                    SHIFT TO NEXT BUS
                  </button>
                  <button className="btn cancel" type="button" onClick={confirmCancel}>
                    CONFIRM CANCEL · REFUND ₹{ticket.bus.price}
                  </button>
                </div>
              </>
            )}

            {screen === 'shifted' && ticket && (
              <>
                <StatusBar />
                <div className="ty">
                  <div className="check" aria-hidden>
                    <i />
                  </div>
                  <h3>Trip shifted</h3>
                  <div className="pnr">
                    Seat <strong>{ticket.seat}</strong> · {ticket.bus.operator}
                    <br />
                    {ticket.bus.dep} · {ticket.boarding}
                    <br />
                    New PNR {ticket.pnr}
                  </div>
                  <div className="countdown">
                    <div className="k">Updated free change</div>
                    <div className="v">Till {ticket.freeUntil}</div>
                    <div className="s">1 free shift used · second shift costs 10%.</div>
                  </div>
                  <div className="ty-actions">
                    <div className="btn-row">
                      <button className="btn shift" type="button" onClick={() => flash('Free shift already used')}>
                        SHIFT BUS
                      </button>
                      <button className="btn cancel" type="button" onClick={doCancel}>
                        CANCEL
                      </button>
                    </div>
                    <button className="btn ghost" type="button" onClick={() => setScreen('home')}>
                      DONE
                    </button>
                  </div>
                </div>
                <BottomNav active="bookings" />
              </>
            )}
          </div>
          <div className="homeind" />
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <aside className="legend">
        <strong>Try the flow</strong>
        <ol>
          <li>Search → tap a Departing Soon bus</li>
          <li>Pick seat → pay (any UPI)</li>
          <li>Thank-you: <em>SHIFT BUS</em> or <em>CANCEL</em></li>
          <li>Shift: see ₹ back / pay more / same fare</li>
        </ol>
      </aside>
    </div>
  )
}
