import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './config/db'
import User from './models/User'
import Task from './models/Task'
import SupporterOffer from './models/SupporterOffer'

dotenv.config()

const calculateLevel = (points: number) => Math.min(100, Math.floor(points / 100))

const seed = async () => {
  await connectDB()

  await SupporterOffer.deleteMany({})
  await Task.deleteMany({})
  await User.deleteMany({})
  console.log('Datenbank geleert')

  const pwDefault = 'password123'
  const pwMain    = 'maxmustermann'

  // Test-User
  const mainPoints = 2750
  const mainUser = await User.create({
    username:       'MaxMustermann',
    email:          'max.mustermann@example.de',
    password:       pwMain,
    fullName:       'Max Mustermann',
    points:         mainPoints,
    level:          calculateLevel(mainPoints),
    badges:         ['Erster Schritt', 'Helfer', 'Vertrauenswürdig'],
    location: {
      country:      'Deutschland',
      state:        'Berlin',
      district:     'Charlottenburg',
      neighborhood: 'Hackescher Markt',
    },
    supporterEntry: {
      bio:      'Ich helfe gerne bei IT-Problemen, Umzügen und Nachhilfe in Mathe und Physik.',
      isActive: true,
    },
  })
  console.log(`Test-User erstellt: MaxMustermann / maxmustermann (LVL ${calculateLevel(mainPoints)})`)

  // Supporters anlegen
  const supporterData = [
    { username: 'TechWizard42',    points: 8900, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Hackescher Markt'  }, bio: 'PC-Reparatur, WLAN-Setup, Smartphone-Hilfe – ich bin für alles zuständig.' },
    { username: 'LernCoach_Lisa',  points: 7200, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Boxhagener Platz'  }, bio: 'Nachhilfe in Mathe, Deutsch und Englisch bis Klasse 12.' },
    { username: 'HandwerkerHans',  points: 6500, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Mitte',   neighborhood: 'Maxvorstadt'       }, bio: 'Reparaturen, Möbelaufbau, Malerarbeiten – alles aus einer Hand.' },
    { username: 'MusicMentor',     points: 5800, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg', neighborhood: 'Kollwitzkiez'      }, bio: 'Gitarre, Klavier und Musiktheorie für Anfänger und Fortgeschrittene.' },
    { username: 'FitnessFred',     points: 5100, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Innenstadt', neighborhood: 'Altstadt-Nord'     }, bio: 'Sport und Bewegung, Trainingsplan erstellen, gemeinsam joggen.' },
    { username: 'GardenGuru',      points: 4600, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Nord',    neighborhood: 'Schwabing'         }, bio: 'Gartenpflege, Bepflanzung, Umzugshilfe mit eigenem Transporter.' },
    { username: 'CodeCoach_Kim',   points: 4200, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Hackescher Markt'  }, bio: 'Programmieren lernen? Ich erkläre Python, JavaScript und Web-Basics.' },
    { username: 'Umzugsprofi99',   points: 3900, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Alexanderplatz'   }, bio: 'Umzüge, schwere Möbel, Transport – ich bringe Kraft mit.' },
    { username: 'SprachTandem',    points: 3400, location: { country: 'Deutschland', state: 'Hamburg', district: 'Hamburg-Mitte',   neighborhood: 'HafenCity'         }, bio: 'Arabisch, Türkisch und Englisch – ich helfe beim Sprachlernen.' },
    { username: 'BewerbungsHilfe', points: 3100, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Samariterplatz'    }, bio: 'CV, Anschreiben und Vorstellungsgespräch – ich begleite dich.' },
    { username: 'TechSupport_Tom', points: 2800, location: { country: 'Deutschland', state: 'NRW',     district: 'Düsseldorf',      neighborhood: 'Stadtmitte'        }, bio: 'Windows, macOS, Drucker, Router – kein Problem zu klein.' },
    { username: 'NachbarHilft',    points: 2400, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Hackescher Markt'  }, bio: 'Einkaufen, Arztbegleitung, Gesellschaft leisten – ich bin da.' },
    { username: 'KreativKlara',    points: 2100, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Mitte',   neighborhood: 'Glockenbachviertel'}, bio: 'Fotografie, Grafikdesign, kreative Projekte – alles machbar.' },
    { username: 'TierfreundTina',  points: 1800, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg', neighborhood: 'Helmholtzplatz'    }, bio: 'Tierbetreuung, Gassi gehen, Katzensitting – liebevoll und zuverlässig.' },
    { username: 'SeniorenHilfe',   points: 1500, location: { country: 'Deutschland', state: 'Hamburg', district: 'Altona',          neighborhood: 'Ottensen'          }, bio: 'Ich helfe Senioren bei Behördengängen, Technik und Alltag.' },
    { username: 'ReparaturRudi',   points: 1200, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Süd',     neighborhood: 'Sendling'          }, bio: 'Fahrrad reparieren, kleine Elektrik, Möbel reparieren.' },
    { username: 'SportBuddy_Ben',  points:  950, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Tiergarten'        }, bio: 'Gemeinsam Sport machen – Laufen, Radfahren, Schwimmen.' },
    { username: 'LesePateMia',     points:  750, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Ehrenfeld',  neighborhood: 'Ehrenfeld'         }, bio: 'Vorlesen, Lernhilfe für Kinder, Begleitung bei Schulaufgaben.' },
    { username: 'KüchenkönigKai',  points:  600, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Boxhagener Platz'  }, bio: 'Kochen lernen, Rezepte, gemeinsam kochen – ich teile mein Wissen.' },
    { username: 'ReiseHelferin',   points:  450, location: { country: 'Deutschland', state: 'Hamburg', district: 'Hamburg-Nord',    neighborhood: 'Eppendorf'         }, bio: 'Reisepläne, Visumsanträge, Behördenpost übersetzen.' },
    { username: 'EhrenAmtMona',    points:  300, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Alexanderplatz'   }, bio: 'Ehrenamtlich aktiv – ich helfe wo immer ich kann.' },
    { username: 'JugendCoach_Jo',  points:  200, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Nord',    neighborhood: 'Schwabing'         }, bio: 'Jugendliche begleiten, Bewerbung, Orientierung.' },
    { username: 'GartenNachbar',   points:  150, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Innenstadt', neighborhood: 'Altstadt-Süd'      }, bio: 'Kleingarten, Rasenmähen, Unkraut jäten – mach ich gerne.' },
    { username: 'HelferHerz',      points:  100, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Samariterplatz'    }, bio: 'Neu dabei, aber motiviert – ich helfe gerne bei allem.' },
    { username: 'AnfängerAlex',    points:   50, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Hackescher Markt'  }, bio: 'Ich starte gerade und freue mich auf erste Aufgaben.' },
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

  // Seekers anlegen
  const seekerData = [
    { username: 'HilfeSucher_Anna',   points: 420, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Hackescher Markt'  } },
    { username: 'MustermannMax',       points: 180, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Mitte',   neighborhood: 'Maxvorstadt'       } },
    { username: 'ElternteilEva',       points: 300, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg', neighborhood: 'Kollwitzkiez'      } },
    { username: 'RentnerRoland',       points:  90, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Innenstadt', neighborhood: 'Altstadt-Nord'     } },
    { username: 'StudentSven',         points: 510, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Boxhagener Platz'  } },
    { username: 'AzubiAmira',          points: 240, location: { country: 'Deutschland', state: 'Hamburg', district: 'Hamburg-Mitte',   neighborhood: 'HafenCity'         } },
    { username: 'FreiberuflerFinn',    points: 660, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Alexanderplatz'   } },
    { username: 'FlüchtlingFarida',    points: 120, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Nord',    neighborhood: 'Schwabing'         } },
    { username: 'AlleinMuttiAlice',    points: 390, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Samariterplatz'    } },
    { username: 'PflegebedürftigPaul', points:  60, location: { country: 'Deutschland', state: 'NRW',     district: 'Düsseldorf',      neighborhood: 'Stadtmitte'        } },
    { username: 'WgBewohnerWilma',     points: 270, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Hackescher Markt'  } },
    { username: 'NeuInDeutschlandNoa', points: 150, location: { country: 'Deutschland', state: 'Hamburg', district: 'Altona',          neighborhood: 'Ottensen'          } },
    { username: 'BeschäftigtBernd',    points: 480, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Süd',     neighborhood: 'Sendling'          } },
    { username: 'JungeSeniorinYvette', points: 210, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg', neighborhood: 'Helmholtzplatz'    } },
    { username: 'HandwerkerKunde_Kai', points: 330, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Ehrenfeld',  neighborhood: 'Ehrenfeld'         } },
    { username: 'SchreibblockadeScott',points: 720, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Tiergarten'        } },
    { username: 'TierbesitzerinTamara',points: 540, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Boxhagener Platz'  } },
    { username: 'GerneGeholfen_Greta', points: 360, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Mitte',   neighborhood: 'Glockenbachviertel'} },
    { username: 'DigitalDistanzDavid', points: 200, location: { country: 'Deutschland', state: 'NRW',     district: 'Köln-Innenstadt', neighborhood: 'Altstadt-Süd'      } },
    { username: 'UmzugStress_Ulla',    points: 440, location: { country: 'Deutschland', state: 'Hamburg', district: 'Hamburg-Nord',    neighborhood: 'Eppendorf'         } },
    { username: 'LernLücke_Leon',      points: 280, location: { country: 'Deutschland', state: 'Berlin',  district: 'Mitte',           neighborhood: 'Hackescher Markt'  } },
    { username: 'GartenAnfänger_Gabi', points: 160, location: { country: 'Deutschland', state: 'Bayern',  district: 'München-Nord',    neighborhood: 'Schwabing'         } },
    { username: 'BerufsWechsel_Boris', points: 600, location: { country: 'Deutschland', state: 'Berlin',  district: 'Friedrichshain',  neighborhood: 'Samariterplatz'    } },
    { username: 'KreativBlockade_Kira',points: 320, location: { country: 'Deutschland', state: 'NRW',     district: 'Düsseldorf',      neighborhood: 'Stadtmitte'        } },
    { username: 'AlltagsHeld_Arthur',  points:  80, location: { country: 'Deutschland', state: 'Berlin',  district: 'Prenzlauer Berg', neighborhood: 'Kollwitzkiez'      } },
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

  // Freundesliste setzen
  const friendIds = [
    supporters[0]._id, supporters[1]._id, supporters[6]._id,
    supporters[11]._id, supporters[3]._id,
    seekers[0]._id, seekers[4]._id, seekers[10]._id,
  ]
  await User.findByIdAndUpdate(mainUser._id, { $set: { friends: friendIds } })
  console.log('Freundesliste für MaxMustermann gesetzt')

  // Tasks anlegen
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
    // offene Tasks
    {
      title:           'WLAN-Router neu einrichten',
      description:     'Mein Router hat ein Firmware-Update bekommen und jetzt kommen keine Geräte mehr ins Netz. Ich brauche Hilfe beim Zurücksetzen und Neukonfigurieren.',
      categories:      ['Geistig'],
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
      categories:      ['Geistig', 'Sozial & Kommunikation'],
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
      categories:      ['Körperlich', 'Körperlich'],
      difficulty:      4, durationMinutes: 240,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[19]._id,
    },
    {
      title:           'Python-Grundlagen erklären',
      description:     'Ich möchte mit Python anfangen. Brauche jemanden der mir Variablen, Schleifen und einfache Funktionen erklärt.',
      categories:      ['Geistig', 'Geistig'],
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
      categories:      ['Körperlich'],
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
      categories:      ['Körperlich', 'Körperlich'],
      difficulty:      2, durationMinutes: 180,
      location:        'München-Schwabing',
      status:          'open',
      createdBy:       seekers[21]._id,
    },


    {
      title:           'Excel-Tabelle für Haushaltsbuch erstellen',
      description:     'Ich möchte meine Ausgaben besser im Blick behalten. Jemand soll mir eine übersichtliche Excel-Vorlage mit Formeln bauen.',
      categories:      ['Geistig', 'Geistig'],
      difficulty:      2, durationMinutes: 60,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[6]._id,
    },
    {
      title:           'Türschloss wechseln – Wohnungstür klemmt',
      description:     'Das Schloss meiner Wohnungstür ist defekt und lässt sich kaum noch öffnen. Brauche jemanden mit handwerklichem Geschick.',
      categories:      ['Körperlich'],
      difficulty:      3, durationMinutes: 90,
      location:        'Köln-Ehrenfeld',
      status:          'open',
      createdBy:       seekers[14]._id,
    },
    {
      title:           'Arabische Schrift lernen – Grundlagen',
      description:     'Ich möchte arabische Schriftzeichen lernen um Briefe meiner Großeltern lesen zu können. Suche geduldsame Lernbegleitung.',
      categories:      ['Geistig', 'Sozial & Kommunikation'],
      difficulty:      3, durationMinutes: 90,
      location:        'Hamburg-HafenCity',
      status:          'open',
      createdBy:       seekers[5]._id,
    },
    {
      title:           'Geburtstagsfeier dekorieren – 50 Gäste',
      description:     'Ich plane eine Überraschungsparty für meinen Mann. Hilfe beim Aufbauen, Dekorieren und Vorbereiten des Buffets gesucht.',
      categories:      ['Talent & Kreativität', 'Körperlich'],
      difficulty:      2, durationMinutes: 180,
      location:        'München-Schwabing',
      status:          'open',
      createdBy:       seekers[17]._id,
    },
    {
      title:           'Rollstuhl-Transport zum Arzt',
      description:     'Meine Mutter ist auf den Rollstuhl angewiesen. Wir suchen jemanden der uns zum Arzttermin fährt und wieder abholt.',
      categories:      ['Körperlich', 'Sozial & Kommunikation'],
      difficulty:      1, durationMinutes: 120,
      location:        'Düsseldorf-Stadtmitte',
      status:          'open',
      createdBy:       seekers[9]._id,
    },
    {
      title:           'Logo für kleines Unternehmen entwerfen',
      description:     'Ich eröffne einen kleinen Online-Shop für Handmade-Schmuck und brauche ein einfaches, modernes Logo.',
      categories:      ['Talent & Kreativität'],
      difficulty:      3, durationMinutes: 180,
      location:        'Berlin-Friedrichshain',
      status:          'open',
      createdBy:       seekers[23]._id,
    },
    {
      title:           'Wasserhahn austauschen – Küche',
      description:     'Der Wasserhahn in meiner Küche tropft seit Wochen. Ich habe bereits einen neuen Hahn gekauft – suche jemanden zum Einbauen.',
      categories:      ['Körperlich'],
      difficulty:      3, durationMinutes: 60,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[10]._id,
    },
    {
      title:           'Sprachkurs Türkisch – Konversation für Anfänger',
      description:     'Ich habe türkische Kollegen und möchte ein paar Grundsätze und Höflichkeitsfloskeln lernen. 2 Stunden würden reichen.',
      categories:      ['Geistig', 'Sozial & Kommunikation'],
      difficulty:      2, durationMinutes: 120,
      location:        'Köln-Altstadt-Nord',
      status:          'open',
      createdBy:       seekers[3]._id,
    },
    {
      title:           'Wohnung streichen – 2 Zimmer',
      description:     'Ich ziehe nächsten Monat ein und möchte vorher 2 Zimmer neu streichen. Farbe ist vorhanden. Hilfe beim Abkleben und Rollen gesucht.',
      categories:      ['Körperlich', 'Körperlich'],
      difficulty:      3, durationMinutes: 360,
      location:        'Hamburg-Altona',
      status:          'open',
      createdBy:       seekers[19]._id,
    },
    {
      title:           'Podcast aufnehmen – technische Einrichtung',
      description:     'Ich möchte mit einem Freund einen Podcast starten. Brauche Hilfe bei der Technik: Mikrofon einrichten, Audacity konfigurieren, ersten Test aufnehmen.',
      categories:      ['Geistig', 'Talent & Kreativität'],
      difficulty:      3, durationMinutes: 120,
      location:        'Berlin-Prenzlauer Berg',
      status:          'open',
      createdBy:       seekers[4]._id,
    },
    {
      title:           'Bewerbungsmappe für Ausbildungsstelle',
      description:     'Mein Sohn bewirbt sich um eine Ausbildung als Elektriker. Wir suchen Hilfe beim Verfassen des Anschreibens und Überprüfen der Unterlagen.',
      categories:      ['Sozial & Kommunikation', 'Geistig'],
      difficulty:      2, durationMinutes: 90,
      location:        'München-Mitte',
      status:          'open',
      createdBy:       seekers[1]._id,
    },
    {
      title:           'Aquarium einrichten – 120-Liter-Becken',
      description:     'Ich habe ein gebrauchtes Aquarium gekauft und bin Anfänger. Jemand soll mir beim Einrichten, Bepflanzen und der ersten Wasserbefüllung helfen.',
      categories:      ['Körperlich', 'Geistig'],
      difficulty:      3, durationMinutes: 150,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[20]._id,
    },
    {
      title:           'Tanzen lernen – Salsa-Grundschritte',
      description:     'Ich habe in 3 Wochen eine Hochzeit und möchte ein paar Salsa-Grundschritte lernen. Suche eine geduldige Tanzhilfe für 2–3 Übungsstunden.',
      categories:      ['Talent & Kreativität', 'Körperlich'],
      difficulty:      2, durationMinutes: 90,
      location:        'Berlin-Tiergarten',
      status:          'open',
      createdBy:       seekers[15]._id,
    },
    {
      title:           'Keller ausmisten und entsorgen',
      description:     'Mein Keller ist voller alter Möbel und Kartons. Ich brauche kräftige Hilfe beim Rausschleppen – Sperrmüll ist bereits angemeldet.',
      categories:      ['Körperlich', 'Körperlich'],
      difficulty:      3, durationMinutes: 240,
      location:        'Köln-Innenstadt',
      status:          'open',
      createdBy:       seekers[24]._id,
    },
    {
      title:           'Nachhilfe Chemie – Oberstufe',
      description:     'Organische Chemie macht mir Probleme. Ich brauche Hilfe bei Reaktionsmechanismen und Strukturformeln für die nächste Klausur.',
      categories:      ['Geistig'],
      difficulty:      4, durationMinutes: 90,
      location:        'Hamburg-Eppendorf',
      status:          'open',
      createdBy:       seekers[11]._id,
    },
    {
      title:           'Hundetraining – Grundkommandos',
      description:     'Mein Labrador-Welpe (6 Monate) kennt keine Kommandos und springt alles an. Ich suche jemanden mit Hundeerfahrung für erste Trainingseinheiten.',
      categories:      ['Sozial & Kommunikation', 'Körperlich'],
      difficulty:      3, durationMinutes: 90,
      location:        'Berlin-Prenzlauer Berg',
      status:          'open',
      createdBy:       seekers[16]._id,
    },
    {
      title:           'Handyhülle selbst gestalten – Workshop',
      description:     'Ich möchte meiner Schwester eine selbst gestaltete Handyhülle schenken. Jemand soll mir zeigen wie das geht – Material bringe ich mit.',
      categories:      ['Talent & Kreativität'],
      difficulty:      1, durationMinutes: 60,
      location:        'München-Glockenbachviertel',
      status:          'open',
      createdBy:       seekers[17]._id,
    },
    {
      title:           'WLAN-Verstärker einrichten – totes Leck in der Wohnung',
      description:     'In meinem Schlafzimmer kommt kein Signal an. Ich habe bereits einen Repeater gekauft, weiß aber nicht wie ich ihn richtig konfiguriere.',
      categories:      ['Geistig'],
      difficulty:      2, durationMinutes: 30,
      location:        'Berlin-Mitte',
      status:          'open',
      createdBy:       seekers[21]._id,
    },
    {
      title:           'Fensterrahmen streichen – Außenseite',
      description:     'Die Farbe an meinen Fensterrahmen blättert ab. Ich brauche Hilfe beim Abschleifen, Grundieren und Streichen – Leiter ist vorhanden.',
      categories:      ['Körperlich'],
      difficulty:      3, durationMinutes: 240,
      location:        'Hamburg-Ottensen',
      status:          'open',
      createdBy:       seekers[18]._id,
    },
    {
      title:           'Gesellschaft leisten – Seniorin sucht Gesprächspartner',
      description:     'Ich bin 80, lebe allein und freue mich über Besuch. Kaffeetrinken, Karten spielen, erzählen – einfach eine nette Stunde zusammen.',
      categories:      ['Sozial & Kommunikation'],
      difficulty:      1, durationMinutes: 60,
      location:        'Köln-Altstadt-Süd',
      status:          'open',
      createdBy:       seekers[9]._id,
    },

    // angenommene Tasks
    {
      title:           'Drucker installieren – Windows 11',
      description:     'Mein neuer HP-Drucker wird von Windows nicht erkannt. Treiber-Installation schlägt immer fehl.',
      categories:      ['Geistig'],
      difficulty:      2, durationMinutes: 45,
      location:        'Berlin-Mitte',
      status:          'assigned',
      createdBy:       seekers[1]._id,
      assignedTo:      supporters[0]._id,
    },
    {
      title:           'Fahrrad reparieren – Gangschaltung',
      description:     'Meine Gangschaltung springt ständig. Ich brauche jemanden der sich mit Fahrrädern auskennt.',
      categories:      ['Körperlich', 'Körperlich'],
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
      title:           'Steuererklärung vorbereiten – erstes Mal',
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
      categories:      ['Geistig', 'Talent & Kreativität'],
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


    {
      title:           'Nähmaschine reparieren – Fadenproblem',
      description:     'Meine alte Singer-Nähmaschine macht Schlaufen auf der Unterseite. Ich brauche jemanden der sich mit Nähmaschinen auskennt.',
      categories:      ['Körperlich', 'Talent & Kreativität'],
      difficulty:      3, durationMinutes: 60,
      location:        'Berlin-Mitte',
      status:          'assigned',
      createdBy:       seekers[23]._id,
      assignedTo:      supporters[2]._id,
    },
    {
      title:           'Instagram-Profil für Kleinunternehmen optimieren',
      description:     'Meine Bäckerei hat 200 Follower – ich weiß nicht was ich falsch mache. Jemand soll sich das Profil ansehen und mir konkrete Tipps geben.',
      categories:      ['Geistig', 'Sozial & Kommunikation'],
      difficulty:      2, durationMinutes: 90,
      location:        'München-Maxvorstadt',
      status:          'assigned',
      createdBy:       seekers[1]._id,
      assignedTo:      supporters[6]._id,
    },
    {
      title:           'Rollrasen verlegen – Vorgarten 40 m²',
      description:     'Ich habe Rollrasen bestellt. Jemand soll mir beim Vorbereiten des Bodens und Verlegen helfen. Schubkarre und Harke sind vorhanden.',
      categories:      ['Körperlich', 'Körperlich'],
      difficulty:      3, durationMinutes: 180,
      location:        'Köln-Ehrenfeld',
      status:          'assigned',
      createdBy:       seekers[14]._id,
      assignedTo:      supporters[5]._id,
    },
    {
      title:           'Geige stimmen und Anfängerstunde',
      description:     'Ich habe eine alte Geige gefunden und möchte damit anfangen. Brauche jemanden der sie stimmt und mir die ersten Töne beibringt.',
      categories:      ['Talent & Kreativität'],
      difficulty:      2, durationMinutes: 60,
      location:        'Berlin-Friedrichshain',
      status:          'assigned',
      createdBy:       seekers[22]._id,
      assignedTo:      supporters[3]._id,
    },
    {
      title:           'Antrag auf Elterngeld ausfüllen',
      description:     'Ich bin überfordert mit dem Elterngeld-Antrag. Jemand der das schon gemacht hat soll mir Schritt für Schritt dabei helfen.',
      categories:      ['Sozial & Kommunikation', 'Geistig'],
      difficulty:      3, durationMinutes: 90,
      location:        'Hamburg-Altona',
      status:          'assigned',
      createdBy:       seekers[18]._id,
      assignedTo:      supporters[9]._id,
    },

    // abgeschlossene Tasks
    {
      title:           'Nachhilfe Physik – Abitur-Vorbereitung',
      description:     'Mein Sohn hat in 6 Wochen Abitur in Physik. Wir brauchen intensive Unterstützung.',
      categories:      ['Geistig'],
      difficulty:      5, durationMinutes: 120,
      location:        'Berlin-Mitte',
      status:          'done',
      createdBy:       seekers[0]._id,
      assignedTo:      mainUser._id,
      completedAt:     new Date('2026-05-10'),
    },
    {
      title:           'PC zusammenbauen',
      description:     'Ich habe alle Teile gekauft. Brauche jemanden der mir beim Zusammenbau des Gaming-PCs hilft.',
      categories:      ['Geistig', 'Körperlich'],
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
      categories:      ['Körperlich'],
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
      categories:      ['Körperlich', 'Körperlich'],
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
      categories:      ['Geistig'],
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
      assignedTo:      mainUser._id,
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

  for (const t of tasks) {
    const task = new Task(t)
    await task.save()
  }
  console.log(`${tasks.length} Tasks erstellt (${tasks.filter(t => t.status === 'open').length} offen, ${tasks.filter(t => t.status === 'assigned').length} angenommen, ${tasks.filter(t => t.status === 'done').length} abgeschlossen)`)

  // Supporter-Angebote anlegen
  const offers = [
    // aktive Angebote
    {
      title:           'Ich fahre heute Nachmittag nach Hamburg – kann Pakete mitnehmen',
      description:     'Starte um 14 Uhr in Berlin-Mitte Richtung Hamburg. Kann kleine Pakete oder Gegenstände (bis 20 kg) mitnehmen. Meldet euch bis 12 Uhr.',
      createdBy:       supporters[7]._id,
      categories:      ['Körperlich'],
      location:        'Berlin → Hamburg',
      offerDate:       new Date('2026-06-28'),
      difficulty:      2,
      durationMinutes: 180,
      pointValue:      360,
      status:          'active',
    },
    {
      title:           'Kostenlose Nachhilfestunde für Grundschüler diese Woche',
      description:     'Ich biete diese Woche zwei kostenlose Nachhilfestunden in Mathe und Deutsch für Grundschüler an. Meldet euch einfach – komme auch nach Hause.',
      createdBy:       supporters[1]._id,
      categories:      ['Geistig'],
      location:        'Berlin-Friedrichshain',
      offerDate:       new Date('2026-06-30'),
      difficulty:      3,
      durationMinutes: 60,
      pointValue:      180,
      status:          'active',
    },
    {
      title:           'Gehe morgen früh zum Wochenmarkt – kann Einkäufe miterledigen',
      description:     'Ich bin morgen Samstag ab 9 Uhr auf dem Markt am Kollwitzplatz. Wer eine Einkaufsliste hat: einfach schicken, ich bringe es vorbei.',
      createdBy:       supporters[11]._id,
      categories:      ['Körperlich', 'Sozial & Kommunikation'],
      location:        'Berlin-Prenzlauer Berg',
      offerDate:       new Date('2026-06-28'),
      difficulty:      1,
      durationMinutes: 45,
      pointValue:      45,
      status:          'active',
    },
    {
      title:           'Kostenloser PC-Check – Frühjahrsputz für euren Rechner',
      description:     'Ich biete diese Woche gratis PC-Checks an: Viren entfernen, Updates einspielen, Arbeitsspeicher aufräumen. Windows und Mac. Komme auch vorbei.',
      createdBy:       supporters[0]._id,
      categories:      ['Geistig'],
      location:        'Berlin-Mitte',
      difficulty:      4,
      durationMinutes: 90,
      pointValue:      360,
      status:          'active',
    },
    {
      title:           'Hundebetreuung am Wochenende – habe selbst einen Hund',
      description:     'Ich passe dieses Wochenende auf einen weiteren Hund auf. Mein Hund ist freundlich und mag Gesellschaft. Kleinhunde bevorzugt.',
      createdBy:       supporters[13]._id,
      categories:      ['Sozial & Kommunikation'],
      location:        'Berlin-Prenzlauer Berg',
      offerDate:       new Date('2026-06-29'),
      difficulty:      2,
      durationMinutes: 120,
      pointValue:      240,
      status:          'active',
    },
    {
      title:           'Helfe beim Möbelaufbau – habe alle Werkzeuge dabei',
      description:     'Bin gelernter Schreiner und helfe gerne beim Aufbau von IKEA-Möbeln oder sonstigen Aufbauprojekten. Habe eigenes Werkzeug inklusive Bohrmaschine.',
      createdBy:       supporters[2]._id,
      categories:      ['Körperlich'],
      location:        'München-Mitte',
      offerDate:       new Date('2026-07-02'),
      difficulty:      3,
      durationMinutes: 150,
      pointValue:      450,
      status:          'active',
    },
    {
      title:           'Biete Probestunde Gitarre oder Klavier – kostenlos',
      description:     'Ich unterrichte seit 8 Jahren und biete diese Woche kostenlose Probestunden an. Anfänger herzlich willkommen. Instrument muss vorhanden sein.',
      createdBy:       supporters[3]._id,
      categories:      ['Talent & Kreativität'],
      location:        'Berlin-Prenzlauer Berg',
      offerDate:       new Date('2026-07-01'),
      difficulty:      3,
      durationMinutes: 60,
      pointValue:      180,
      status:          'active',
    },
    {
      title:           'Fahre Samstag zum IKEA – kann jemanden mitnehmen oder Sachen abholen',
      description:     'Fahre am Samstag mit dem Auto zum IKEA Tempelhof. Habe noch 2 Plätze frei und Platz im Kofferraum für eine Bestellung. Absprache nötig.',
      createdBy:       supporters[5]._id,
      categories:      ['Körperlich'],
      location:        'Berlin → IKEA Tempelhof',
      offerDate:       new Date('2026-06-28'),
      difficulty:      2,
      durationMinutes: 120,
      pointValue:      240,
      status:          'active',
    },
    {
      title:           'Arabisch-Deutsch Übersetzungshilfe – heute verfügbar',
      description:     'Ich bin muttersprachlich Arabisch und helfe gerne bei Briefen, Formularen oder Behördendokumenten. Kostenlos, heute Nachmittag verfügbar.',
      createdBy:       supporters[8]._id,
      categories:      ['Sozial & Kommunikation'],
      location:        'Hamburg-HafenCity',
      difficulty:      2,
      durationMinutes: 60,
      pointValue:      120,
      status:          'active',
    },

    // abgeschlossene Angebote
    {
      title:           'Habe letzte Woche Einkäufe für 3 Nachbarn erledigt',
      description:     'War beim Supermarkt und habe spontan für Nachbarn miteingekauft. Lief super – mache ich gerne wieder.',
      createdBy:       supporters[11]._id,
      categories:      ['Körperlich', 'Sozial & Kommunikation'],
      location:        'Berlin-Mitte',
      difficulty:      1,
      durationMinutes: 60,
      pointValue:      60,
      status:          'done',
    },
    {
      title:           'Kostenloser Python-Workshop letzten Samstag',
      description:     'Habe 4 Leuten Python-Grundlagen erklärt. Hat Spaß gemacht – der nächste Workshop folgt in 2 Wochen.',
      createdBy:       supporters[6]._id,
      categories:      ['Geistig'],
      location:        'Berlin-Mitte',
      difficulty:      4,
      durationMinutes: 120,
      pointValue:      480,
      status:          'done',
    },
    {
      title:           'Umzugshilfe am letzten Wochenende erfolgreich abgeschlossen',
      description:     'Habe einer Familie beim Umzug in den 4. Stock geholfen. 6 Stunden, viele Treppen, aber hat geklappt!',
      createdBy:       supporters[7]._id,
      categories:      ['Körperlich'],
      location:        'Berlin-Friedrichshain',
      difficulty:      5,
      durationMinutes: 360,
      pointValue:      1800,
      status:          'done',
    },
  ]

  await SupporterOffer.insertMany(offers)
  console.log(`${offers.length} Supporter-Angebote erstellt (${offers.filter(o => o.status === 'active').length} aktiv, ${offers.filter(o => o.status === 'done').length} abgeschlossen)`)

  console.log('\n✅ Seed abgeschlossen!')
  console.log('Test-Login: max.mustermann@example.de / maxmustermann')
  console.log(`MaxMustermann: LVL ${calculateLevel(mainPoints)}, ${mainPoints} Punkte`)
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
