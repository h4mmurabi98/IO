import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './config/db'
import User from './models/User'
import Task from './models/Task'

dotenv.config()

const calculateLevel = (points: number) => Math.min(100, Math.floor(points / 100))

const seed = async () => {
  await connectDB()

  // Alles löschen und neu aufbauen
  await Task.deleteMany({})
  await User.deleteMany({})
  console.log('Datenbank geleert')

  // Passwörter als Klartext – pre-save Hook hasht sie automatisch
  const pwDefault  = 'password123'
  const pwAbdullah = '19982000'

  // ── Test-User (Abdullah) ──────────────────────────────────────────────────
  const abdullahPoints = 2750
  const abdullah = await User.create({
    username:       'H4mmurabi98',
    email:          'frostaliraqi98@gmail.com',
    password:       pwAbdullah,
    points:         abdullahPoints,
    level:          calculateLevel(abdullahPoints),
    badges:         ['Erster Schritt', 'Helfer', 'Vertrauenswürdig'],
    location: {
      country:      'Deutschland',
      state:        'Berlin',
      district:     'Mitte',
      neighborhood: 'Hackescher Markt',
    },
    supporterEntry: {
      bio:      'Ich helfe gerne bei IT-Problemen, Umzügen und Nachhilfe in Mathe und Physik.',
      isActive: true,
    },
  })
  console.log(`Test-User erstellt: H4mmurabi98 / 19982000 (LVL ${calculateLevel(abdullahPoints)})`)

  // ── 25 Supporters ─────────────────────────────────────────────────────────
  const supporterData = [
    { username: 'TechWizard42',   points: 8900, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Hackescher Markt' }, bio: 'PC-Reparatur, WLAN-Setup, Smartphone-Hilfe – ich bin für alles zuständig.' },
    { username: 'LernCoach_Lisa', points: 7200, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain', neighborhood: 'Boxhagener Platz' }, bio: 'Nachhilfe in Mathe, Deutsch und Englisch bis Klasse 12.' },
    { username: 'HandwerkerHans', points: 6500, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Mitte',  neighborhood: 'Maxvorstadt'      }, bio: 'Reparaturen, Möbelaufbau, Malerarbeiten – alles aus einer Hand.' },
    { username: 'MusicMentor',    points: 5800, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg',neighborhood: 'Kollwitzkiez'     }, bio: 'Gitarre, Klavier und Musiktheorie für Anfänger und Fortgeschrittene.' },
    { username: 'FitnessFred',    points: 5100, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Innenstadt',neighborhood: 'Altstadt-Nord'    }, bio: 'Sport und Bewegung, Trainingsplan erstellen, gemeinsam joggen.' },
    { username: 'GardenGuru',     points: 4600, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Nord',   neighborhood: 'Schwabing'        }, bio: 'Gartenpflege, Bepflanzung, Umzugshilfe mit eigenem Transporter.' },
    { username: 'CodeCoach_Kim',  points: 4200, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Hackescher Markt' }, bio: 'Programmieren lernen? Ich erkläre Python, JavaScript und Web-Basics.' },
    { username: 'Umzugsprofi99',  points: 3900, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Alexanderplatz'  }, bio: 'Umzüge, schwere Möbel, Transport – ich bringe Kraft mit.' },
    { username: 'SprachTandem',   points: 3400, location: { country: 'Deutschland', state: 'Hamburg', district: 'Hamburg-Mitte',  neighborhood: 'HafenCity'        }, bio: 'Arabisch, Türkisch und Englisch – ich helfe beim Sprachlernen.' },
    { username: 'BewerbungsHilfe',points: 3100, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain', neighborhood: 'Samariterplatz'   }, bio: 'CV, Anschreiben und Vorstellungsgespräch – ich begleite dich.' },
    { username: 'TechSupport_Tom',points: 2800, location: { country: 'Deutschland', state: 'NRW',     district: 'Düsseldorf',     neighborhood: 'Stadtmitte'       }, bio: 'Windows, macOS, Drucker, Router – kein Problem zu klein.' },
    { username: 'NachbarHilft',   points: 2400, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Hackescher Markt' }, bio: 'Einkaufen, Arztbegleitung, Gesellschaft leisten – ich bin da.' },
    { username: 'KreativKlara',   points: 2100, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Mitte',  neighborhood: 'Glockenbachviertel'},bio: 'Fotografie, Grafikdesign, kreative Projekte – alles machbar.' },
    { username: 'TierfreundTina', points: 1800, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg',neighborhood: 'Helmholtzplatz'  }, bio: 'Tierbetreuung, Gassi gehen, Katzensitting – liebevoll und zuverlässig.' },
    { username: 'SeniorenHilfe',  points: 1500, location: { country: 'Deutschland', state: 'Hamburg', district: 'Altona',         neighborhood: 'Ottensen'         }, bio: 'Ich helfe Senioren bei Behördengängen, Technik und Alltag.' },
    { username: 'ReparaturRudi',  points: 1200, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Süd',    neighborhood: 'Sendling'         }, bio: 'Fahrrad reparieren, kleine Elektrik, Möbel reparieren.' },
    { username: 'SportBuddy_Ben', points:  950, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Tiergarten'       }, bio: 'Gemeinsam Sport machen – Laufen, Radfahren, Schwimmen.' },
    { username: 'LesePateMia',    points:  750, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Ehrenfeld', neighborhood: 'Ehrenfeld'        }, bio: 'Vorlesen, Lernhilfe für Kinder, Begleitung bei Schulaufgaben.' },
    { username: 'KüchenkönigKai', points:  600, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain', neighborhood: 'Boxhagener Platz' }, bio: 'Kochen lernen, Rezepte, gemeinsam kochen – ich teile mein Wissen.' },
    { username: 'ReiseHelferin',  points:  450, location: { country: 'Deutschland', state: 'Hamburg', district: 'Hamburg-Nord',   neighborhood: 'Eppendorf'        }, bio: 'Reisepläne, Visumsanträge, Behördenpost übersetzen.' },
    { username: 'EhrenAmtMona',   points:  300, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Alexanderplatz'  }, bio: 'Ehrenamtlich aktiv – ich helfe wo immer ich kann.' },
    { username: 'JugendCoach_Jo', points:  200, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Nord',   neighborhood: 'Schwabing'        }, bio: 'Jugendliche begleiten, Bewerbung, Orientierung.' },
    { username: 'GartenNachbar',  points:  150, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Innenstadt',neighborhood: 'Altstadt-Süd'    }, bio: 'Kleingarten, Rasenmähen, Unkraut jäten – mach ich gerne.' },
    { username: 'HelferHerz',     points:  100, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain', neighborhood: 'Samariterplatz'   }, bio: 'Neu dabei, aber motiviert – ich helfe gerne bei allem.' },
    { username: 'AnfängerAlex',   points:   50, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Hackescher Markt' }, bio: 'Ich starte gerade und freue mich auf erste Aufgaben.' },
  ]

  const supporters = await Promise.all(
    supporterData.map(d =>
      User.create({
        username:       d.username,
        email:          `${d.username.toLowerCase()}@example.com`,
        password:       pwDefault,
        points:         d.points,
        level:          calculateLevel(d.points),
        badges:         d.points >= 5000 ? ['Erfahrener Helfer', 'Vertrauenswürdig'] : d.points >= 1000 ? ['Erster Schritt'] : [],
        location:       d.location,
        supporterEntry: { bio: d.bio, isActive: true },
      })
    )
  )
  console.log(`${supporters.length} Supporters erstellt`)

  // ── 25 Seekers ────────────────────────────────────────────────────────────
  const seekerData = [
    { username: 'HilfeSucher_Anna',  points: 420, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Hackescher Markt' } },
    { username: 'MaxMustermann',      points: 180, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Mitte',  neighborhood: 'Maxvorstadt'      } },
    { username: 'ElternteilEva',      points: 300, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg',neighborhood: 'Kollwitzkiez'     } },
    { username: 'RentnerRoland',      points:  90, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Innenstadt',neighborhood: 'Altstadt-Nord'    } },
    { username: 'StudentSven',        points: 510, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain', neighborhood: 'Boxhagener Platz' } },
    { username: 'AzubiAmira',         points: 240, location: { country: 'Deutschland', state: 'Hamburg', district: 'Hamburg-Mitte',  neighborhood: 'HafenCity'        } },
    { username: 'FreiberuflerFinn',   points: 660, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Alexanderplatz'  } },
    { username: 'FlüchtlingFarida',   points: 120, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Nord',   neighborhood: 'Schwabing'        } },
    { username: 'AlleinMuttiAlice',   points: 390, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain', neighborhood: 'Samariterplatz'   } },
    { username: 'PflegebedürftigPaul',points:  60, location: { country: 'Deutschland', state: 'NRW',     district: 'Düsseldorf',     neighborhood: 'Stadtmitte'       } },
    { username: 'WgBewohnerWilma',    points: 270, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',          neighborhood: 'Hackescher Markt' } },
    { username: 'NeuInDeutschlandNoa',points: 150, location: { country: 'Deutschland', state: 'Hamburg', district: 'Altona',         neighborhood: 'Ottensen'         } },
    { username: 'BeschäftigtBernd',   points: 480, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Süd',    neighborhood: 'Sendling'         } },
    { username: 'JungeSeniorinYvette',points: 210, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg',neighborhood: 'Helmholtzplatz'  } },
    { username: 'HandwerkerKunde_Kai',points: 330, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Ehrenfeld', neighborhood: 'Ehrenfeld'        } },
    { username: 'SchreibblockadeScott',points: 720, location: { country: 'Deutschland', state: 'Berlin', district: 'Mitte',          neighborhood: 'Tiergarten'       } },
    { username: 'TierbesitzerinTamara',points: 540, location: { country: 'Deutschland', state: 'Berlin', district: 'Friedrichshain', neighborhood: 'Boxhagener Platz' } },
    { username: 'GerneGeholfen_Greta', points: 360, location: { country: 'Deutschland', state: 'Bayern', district: 'München-Mitte',  neighborhood: 'Glockenbachviertel'} },
    { username: 'DigitalDistanzDavid', points: 200, location: { country: 'Deutschland', state: 'NRW',    district: 'Köln-Innenstadt',neighborhood: 'Altstadt-Süd'    } },
    { username: 'UmzugStress_Ulla',    points: 440, location: { country: 'Deutschland', state: 'Hamburg',district: 'Hamburg-Nord',   neighborhood: 'Eppendorf'        } },
    { username: 'LernLücke_Leon',      points: 280, location: { country: 'Deutschland', state: 'Berlin', district: 'Mitte',          neighborhood: 'Hackescher Markt' } },
    { username: 'GartenAnfänger_Gabi', points: 160, location: { country: 'Deutschland', state: 'Bayern', district: 'München-Nord',   neighborhood: 'Schwabing'        } },
    { username: 'BerufsWechsel_Boris', points: 600, location: { country: 'Deutschland', state: 'Berlin', district: 'Friedrichshain', neighborhood: 'Samariterplatz'   } },
    { username: 'KreativBlockade_Kira',points: 320, location: { country: 'Deutschland', state: 'NRW',    district: 'Düsseldorf',     neighborhood: 'Stadtmitte'       } },
    { username: 'AlltagsHeld_Arthur',  points:  80, location: { country: 'Deutschland', state: 'Berlin', district: 'Prenzlauer Berg',neighborhood: 'Kollwitzkiez'     } },
  ]

  const seekers = await Promise.all(
    seekerData.map(d =>
      User.create({
        username:       d.username,
        email:          `${d.username.toLowerCase()}@example.com`,
        password:       pwDefault,
        points:         d.points,
        level:          calculateLevel(d.points),
        badges:         d.points >= 500 ? ['Erster Schritt'] : [],
        location:       d.location,
        supporterEntry: null,
      })
    )
  )
  console.log(`${seekers.length} Seekers erstellt`)

  // ── Freunde für Abdullah ──────────────────────────────────────────────────
  // Ein paar Supporter und Seeker als Freunde hinzufügen
  const friendIds = [
    supporters[0]._id, supporters[1]._id, supporters[6]._id,
    supporters[11]._id, supporters[3]._id,
    seekers[0]._id, seekers[4]._id, seekers[10]._id,
  ]
  await User.findByIdAndUpdate(abdullah._id, { $set: { friends: friendIds } })
  console.log('Freundesliste für H4mmurabi98 gesetzt')

  // ── 30 Tasks ──────────────────────────────────────────────────────────────
  // Hilfsfunktion: pointValue wird über pre-save berechnet
  type TaskStatus = 'open' | 'assigned' | 'done'
  interface TaskSeed {
    title: string; description: string
    categories: string[]; difficulty: number; durationMinutes: number
    location?: string; status: TaskStatus
    createdBy: mongoose.Types.ObjectId
    assignedTo?: mongoose.Types.ObjectId
    completedAt?: Date
  }

  const tasks: TaskSeed[] = [
    // ── OPEN (12 Aufgaben) ──────────────────────────────────────────────────
    {
      title:           'WLAN-Router neu einrichten',
      description:     'Mein Router hat ein Firmware-Update bekommen und jetzt kommen keine Geräte mehr ins Netz. Ich brauche Hilfe beim Zurücksetzen und Neukonfigurieren.',
      categories:      ['Digital & Technik'],
      difficulty:      2, durationMinutes: 45,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[0]._id,
    },
    {
      title:           'Nachhilfe Mathe Klasse 10 – Vektoren',
      description:     'Meine Tochter kommt bei Vektoren und linearer Algebra nicht weiter. Wir suchen jemanden der 2–3 Nachhilfestunden geben kann.',
      categories:      ['Geistig'],
      difficulty:      3, durationMinutes: 90,
      location:        'Berlin-Prenzlauer Berg',
      status:          'open',
      createdBy:       seekers[2]._id,
    },
    {
      title:           'Einkaufen gehen – ältere Dame',
      description:     'Ich bin 74 und komme schlecht zu Fuß. Ich bräuchte jemanden der einmal pro Woche für mich einkaufen geht. Lebensmittel, Drogerie – Liste fertig.',
      categories:      ['Körperlich', 'Sozial & Kommunikation'],
      difficulty:      1, durationMinutes: 60,
      location:        'Köln-Innenstadt',
      status:          'open',
      createdBy:       seekers[3]._id,
    },
    {
      title:           'Bewerbungsschreiben für IT-Stelle überarbeiten',
      description:     'Ich bewerbe mich als Quereinsteiger in der IT und möchte mein Anschreiben von jemandem mit Erfahrung prüfen lassen.',
      categories:      ['Sozial & Kommunikation', 'Geistig'],
      difficulty:      3, durationMinutes: 60,
      location:        'Berlin-Friedrichshain',
      status:          'open',
      createdBy:       seekers[22]._id,
    },
    {
      title:           'Smartphone-Einrichtung für Senioren',
      description:     'Mein Vater hat ein neues Android-Handy bekommen. Er braucht Hilfe bei WhatsApp, E-Mail und dem App-Store.',
      categories:      ['Digital & Technik', 'Sozial & Kommunikation'],
      difficulty:      1, durationMinutes: 90,
      location:        'Hamburg-Altona',
      status:          'open',
      createdBy:       seekers[11]._id,
    },
    {
      title:           'Gitarrenunterricht – Anfänger',
      description:     'Ich möchte Gitarre lernen, habe eine Akustik-Gitarre aber keine Ahnung. Suche jemanden für 4–5 Einführungsstunden.',
      categories:      ['Talent & Kreativität'],
      difficulty:      2, durationMinutes: 60,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[20]._id,
    },
    {
      title:           'Umzugshilfe – 3. Etage ohne Aufzug',
      description:     'Ich ziehe am Wochenende in eine neue Wohnung. Möbel müssen aus dem 3. Stock getragen werden. Suche 2–3 kräftige Helfer.',
      categories:      ['Körperlich', 'Haushalt & Handwerk'],
      difficulty:      4, durationMinutes: 240,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[19]._id,
    },
    {
      title:           'Python-Grundlagen erklären',
      description:     'Ich möchte mit Python anfangen. Brauche jemanden der mir Variablen, Schleifen und einfache Funktionen erklärt.',
      categories:      ['Digital & Technik', 'Geistig'],
      difficulty:      2, durationMinutes: 120,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[4]._id,
    },
    {
      title:           'Katze betreuen für 4 Tage',
      description:     'Ich fahre über Ostern weg. Meine Katze Mochi bleibt zu Hause. Ich brauche jemanden der zweimal täglich vorbeikommt.',
      categories:      ['Sozial & Kommunikation'],
      difficulty:      1, durationMinutes: 30,
      location:        'Berlin-Friedrichshain',
      status:          'open',
      createdBy:       seekers[16]._id,
    },
    {
      title:           'Regal aufbauen (IKEA KALLAX)',
      description:     'Ich habe 3 KALLAX-Regale die aufgebaut werden müssen. Werkzeug ist vorhanden. Ich bin handwerklich nicht begabt.',
      categories:      ['Haushalt & Handwerk'],
      difficulty:      2, durationMinutes: 120,
      location:        'München-Mitte',
      status:          'open',
      createdBy:       seekers[17]._id,
    },
    {
      title:           'Englisch Konversationsstunden',
      description:     'Ich bereite mich auf ein Vorstellungsgespräch auf Englisch vor und möchte meine Sprechfähigkeit üben. 2 Stunden reichen.',
      categories:      ['Geistig', 'Sozial & Kommunikation'],
      difficulty:      2, durationMinutes: 120,
      location:        'Berlin-Tiergarten',
      status:          'open',
      createdBy:       seekers[15]._id,
    },
    {
      title:           'Garten aufräumen nach dem Winter',
      description:     'Mein kleiner Garten ist nach dem Winter ein Chaos. Laub rechen, Büsche schneiden, Beet vorbereiten – 2–3 Stunden Arbeit.',
      categories:      ['Körperlich', 'Haushalt & Handwerk'],
      difficulty:      2, durationMinutes: 180,
      location:        'München-Schwabing',
      status:          'open',
      createdBy:       seekers[21]._id,
    },

    // ── ASSIGNED (8 Aufgaben) ───────────────────────────────────────────────
    {
      title:           'Drucker installieren – Windows 11',
      description:     'Mein neuer HP-Drucker wird von Windows nicht erkannt. Treiber-Installation schlägt immer fehl.',
      categories:      ['Digital & Technik'],
      difficulty:      2, durationMinutes: 45,
      location:        'Berlin-Mitte',
      status:          'assigned',
      createdBy:       seekers[1]._id,
      assignedTo:      supporters[0]._id,
    },
    {
      title:           'Fahrrad reparieren – Gangschaltung',
      description:     'Meine Gangschaltung springt ständig. Ich brauche jemanden der sich mit Fahrrädern auskennt.',
      categories:      ['Haushalt & Handwerk', 'Körperlich'],
      difficulty:      3, durationMinutes: 60,
      location:        'Berlin-Mitte',
      status:          'assigned',
      createdBy:       seekers[5]._id,
      assignedTo:      supporters[15]._id,
    },
    {
      title:           'Lebenslauf gestalten',
      description:     'Mein Lebenslauf sieht veraltet aus. Ich suche jemanden der mir bei Layout und Inhalt hilft.',
      categories:      ['Sozial & Kommunikation', 'Talent & Kreativität'],
      difficulty:      2, durationMinutes: 90,
      location:        'Hamburg-HafenCity',
      status:          'assigned',
      createdBy:       seekers[5]._id,
      assignedTo:      supporters[9]._id,
    },
    {
      title:           'Gemälde restaurieren – kleines Ölbild',
      description:     'Ein altes Familiengemälde hat kleine Risse. Ich suche jemanden mit künstlerischem Talent der es behutsam restauriert.',
      categories:      ['Talent & Kreativität'],
      difficulty:      4, durationMinutes: 180,
      location:        'München-Glockenbachviertel',
      status:          'assigned',
      createdBy:       seekers[17]._id,
      assignedTo:      supporters[12]._id,
    },
    {
      title:           'Hund Gassi führen – 5 Tage',
      description:     'Ich bin diese Woche krank. Mein Golden Retriever braucht täglich 2 × Spaziergang, ca. 30 Minuten.',
      categories:      ['Körperlich', 'Sozial & Kommunikation'],
      difficulty:      1, durationMinutes: 60,
      location:        'Berlin-Prenzlauer Berg',
      status:          'assigned',
      createdBy:       seekers[13]._id,
      assignedTo:      supporters[13]._id,
    },
    {
      title:           'Steuererklärung vorbereiten – erste Mal',
      description:     'Ich mache dieses Jahr zum ersten Mal meine Steuererklärung. Brauche jemanden der mich durch den Prozess führt.',
      categories:      ['Geistig', 'Sozial & Kommunikation'],
      difficulty:      3, durationMinutes: 120,
      location:        'Köln-Ehrenfeld',
      status:          'assigned',
      createdBy:       seekers[14]._id,
      assignedTo:      supporters[9]._id,
    },
    {
      title:           'Website für kleines Café einrichten',
      description:     'Wir brauchen eine einfache Website mit Menü, Öffnungszeiten und Kontakt. Kein großes Budget – WordPress oder ähnliches reicht.',
      categories:      ['Digital & Technik', 'Talent & Kreativität'],
      difficulty:      4, durationMinutes: 300,
      location:        'Berlin-Friedrichshain',
      status:          'assigned',
      createdBy:       seekers[8]._id,
      assignedTo:      supporters[6]._id,
    },
    {
      title:           'Übersetzung Arabisch–Deutsch',
      description:     'Ich habe einen Brief vom Amt bekommen. Ich verstehe nicht alles und brauche eine kurze Übersetzungshilfe.',
      categories:      ['Sozial & Kommunikation'],
      difficulty:      2, durationMinutes: 45,
      location:        'München-Schwabing',
      status:          'assigned',
      createdBy:       seekers[7]._id,
      assignedTo:      supporters[8]._id,
    },

    // ── DONE (10 Aufgaben) ──────────────────────────────────────────────────
    {
      title:           'Nachhilfe Physik – Abitur-Vorbereitung',
      description:     'Mein Sohn hat in 6 Wochen Abitur in Physik. Wir brauchen intensive Unterstützung.',
      categories:      ['Geistig'],
      difficulty:      5, durationMinutes: 120,
      location:        'Berlin-Mitte',
      status:          'done',
      createdBy:       seekers[0]._id,
      assignedTo:      abdullah._id,
      completedAt:     new Date('2026-05-10'),
    },
    {
      title:           'PC zusammenbauen',
      description:     'Ich habe alle Teile gekauft. Brauche jemanden der mir beim Zusammenbau des Gaming-PCs hilft.',
      categories:      ['Digital & Technik'],
      difficulty:      4, durationMinutes: 180,
      location:        'Berlin-Mitte',
      status:          'done',
      createdBy:       seekers[4]._id,
      assignedTo:      supporters[0]._id,
      completedAt:     new Date('2026-05-15'),
    },
    {
      title:           'Badezimmer-Fliesen kitten',
      description:     'Zwischen Wanne und Wand ist die Verfugung rissig. Bitte kitten und abdichten.',
      categories:      ['Haushalt & Handwerk'],
      difficulty:      2, durationMinutes: 90,
      location:        'Berlin-Mitte',
      status:          'done',
      createdBy:       seekers[10]._id,
      assignedTo:      supporters[2]._id,
      completedAt:     new Date('2026-05-08'),
    },
    {
      title:           'Flughafen-Transfer organisieren',
      description:     'Ich komme um 23 Uhr am Flughafen an und brauche Hilfe mit dem Gepäck und dem Weg nach Hause.',
      categories:      ['Körperlich', 'Sozial & Kommunikation'],
      difficulty:      1, durationMinutes: 90,
      location:        'Berlin-Mitte',
      status:          'done',
      createdBy:       seekers[6]._id,
      assignedTo:      supporters[7]._id,
      completedAt:     new Date('2026-05-20'),
    },
    {
      title:           'Social-Media-Fotos machen',
      description:     'Ich brauche professionelle Fotos für mein Instagram-Profil als Freiberuflerin.',
      categories:      ['Talent & Kreativität'],
      difficulty:      3, durationMinutes: 120,
      location:        'München-Mitte',
      status:          'done',
      createdBy:       seekers[17]._id,
      assignedTo:      supporters[12]._id,
      completedAt:     new Date('2026-05-18'),
    },
    {
      title:           'Kochen lernen – vegetarische Küche',
      description:     'Ich möchte gerne vegetarisch kochen und brauche jemanden der mir 3–4 einfache Rezepte beibringt.',
      categories:      ['Talent & Kreativität', 'Sozial & Kommunikation'],
      difficulty:      2, durationMinutes: 120,
      location:        'Berlin-Friedrichshain',
      status:          'done',
      createdBy:       seekers[8]._id,
      assignedTo:      supporters[18]._id,
      completedAt:     new Date('2026-05-22'),
    },
    {
      title:           'Fenster putzen – 4-Zimmer-Wohnung',
      description:     'Ich bin hochschwanger und kann nicht putzen. Bitte alle Fenster innen und außen reinigen.',
      categories:      ['Haushalt & Handwerk', 'Körperlich'],
      difficulty:      2, durationMinutes: 150,
      location:        'Hamburg-Eppendorf',
      status:          'done',
      createdBy:       seekers[19]._id,
      assignedTo:      supporters[4]._id,
      completedAt:     new Date('2026-05-25'),
    },
    {
      title:           'Laptop-Virus entfernen',
      description:     'Mein Laptop ist nach einem Download sehr langsam. Ich glaube ich habe mir etwas eingefangen.',
      categories:      ['Digital & Technik'],
      difficulty:      3, durationMinutes: 90,
      location:        'Köln-Altstadt-Nord',
      status:          'done',
      createdBy:       seekers[3]._id,
      assignedTo:      supporters[10]._id,
      completedAt:     new Date('2026-05-12'),
    },
    {
      title:           'Deutschkurs-Bewerbung ausfüllen',
      description:     'Ich möchte an einem Integrationskurs teilnehmen. Ich brauche Hilfe beim Ausfüllen der Anträge.',
      categories:      ['Sozial & Kommunikation', 'Geistig'],
      difficulty:      2, durationMinutes: 60,
      location:        'München-Schwabing',
      status:          'done',
      createdBy:       seekers[7]._id,
      assignedTo:      abdullah._id,
      completedAt:     new Date('2026-05-28'),
    },
    {
      title:           'Klavier-Einführung für Erwachsene',
      description:     'Ich habe ein geerbtes Klavier und möchte endlich anfangen zu spielen. Erste Schritte bitte.',
      categories:      ['Talent & Kreativität'],
      difficulty:      2, durationMinutes: 60,
      location:        'Berlin-Prenzlauer Berg',
      status:          'done',
      createdBy:       seekers[24]._id,
      assignedTo:      supporters[3]._id,
      completedAt:     new Date('2026-05-30'),
    },
  ]

  // Tasks speichern (pre-save berechnet pointValue)
  for (const t of tasks) {
    const task = new Task(t)
    await task.save()
  }
  console.log(`${tasks.length} Tasks erstellt`)

  // ── Punkte für Abdullah aus abgeschlossenen Tasks gutschreiben ────────────
  // (2 done-Tasks als assignedTo: 600 + 120 = 720 → bereits in den 2750 enthalten)

  console.log('\n✅ Seed abgeschlossen!')
  console.log('────────────────────────────────────────')
  console.log('Test-Login: frostaliraqi98@gmail.com / 19982000')
  console.log(`Abdullah: LVL ${calculateLevel(abdullahPoints)}, ${abdullahPoints} Punkte`)
  console.log('────────────────────────────────────────')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})