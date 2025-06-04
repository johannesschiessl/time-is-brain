"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";

const realStrokeSymptoms = [
  { id: "s1", text: "Hängender Mundwinkel", isStroke: true },
  { id: "s2", text: "Lähmung oder Schwäche in einem Arm", isStroke: true },
  {
    id: "s3",
    text: "Sprachstörungen (verwaschene oder unverständliche Sprache)",
    isStroke: true,
  },
  { id: "s4", text: "Plötzliche Verwirrtheit", isStroke: true },
  {
    id: "s5",
    text: "Sehstörungen (z.B. verschwommenes Sehen, Gesichtsfeldausfälle)",
    isStroke: true,
  },
  { id: "s6", text: "Plötzlicher, sehr starker Kopfschmerz", isStroke: true },
  {
    id: "s7",
    text: "Gleichgewichts- oder Koordinationsstörungen",
    isStroke: true,
  },
];

const distractorSymptoms = [
  { id: "d1", text: "Müdigkeit nach der Schule", isStroke: false },
  { id: "d2", text: "Prüfungsstress oder Nervosität", isStroke: false },
  { id: "d3", text: "Bauchschmerzen", isStroke: false },
  { id: "d4", text: "Kopfschmerzen bei Wetterumschwung", isStroke: false },
  { id: "d5", text: "Stolpern über ein Hindernis", isStroke: false },
  { id: "d6", text: "Erkältungssymptome (Husten, Schnupfen)", isStroke: false },
  {
    id: "d7",
    text: "Hungergefühl und Zittern (z.B. bei niedrigem Blutzucker)",
    isStroke: false,
  },
  {
    id: "d8",
    text: "Konzentrationsschwäche nach wenig Schlaf",
    isStroke: false,
  },
  { id: "d9", text: "Migräne mit Aura", isStroke: false },
  { id: "d10", text: "Angstzustände oder Panikattacke", isStroke: false },
];

const allSymptoms = [...realStrokeSymptoms, ...distractorSymptoms];
console.log(allSymptoms); // TEMP

type Symptom = {
  id: string;
  text: string;
  isStroke: boolean;
};

type PatientCase = {
  id: string;
  description: string;
  symptoms: Symptom[];
  isStrokeCase: boolean;
  patientImage?: string;
};

type GamePhase = "start" | "playing" | "feedback" | "gameOver";

function calculateNeuronsSaved(reactionTimeSeconds: number): number {
  const maxLoss = 19000000;
  const neuronsLostPerSecond = 31666;
  const neuronsLost = Math.min(
    reactionTimeSeconds * neuronsLostPerSecond,
    maxLoss,
  );
  return Math.max(0, maxLoss - neuronsLost);
}

const generateCase = (caseId: string): PatientCase => {
  const selectedSymptoms: Symptom[] = [];
  let hasStrokeSymptom = false;

  hasStrokeSymptom = Math.random() < 0.5;

  if (hasStrokeSymptom) {
    const strokeSymptom =
      realStrokeSymptoms[Math.floor(Math.random() * realStrokeSymptoms.length)];
    selectedSymptoms.push(strokeSymptom);
    hasStrokeSymptom = true;
  }

  if (!hasStrokeSymptom) {
    const distractorSymptom =
      distractorSymptoms[Math.floor(Math.random() * distractorSymptoms.length)];
    selectedSymptoms.push(distractorSymptom);
  }

  const description = selectedSymptoms.map((s) => s.text).join(", ") + ".";
  const patientImage = `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}`;

  return {
    id: caseId,
    description: description,
    symptoms: selectedSymptoms,
    isStrokeCase: hasStrokeSymptom,
    patientImage,
  };
};

const TOTAL_CASES = 5;

export default function GamePage() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("start");
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [timer, setTimer] = useState(0);
  const [totalNeuronsSaved, setTotalNeuronsSaved] = useState(0);
  const [currentNeuronsSaved, setCurrentNeuronsSaved] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackExplanation, setFeedbackExplanation] = useState("");
  const [isDecisionCorrect, setIsDecisionCorrect] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const generatedCases = Array.from({ length: TOTAL_CASES }, (_, i) =>
      generateCase(`case-${i + 1}`),
    );
    setCases(generatedCases);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gamePhase === "playing") {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gamePhase, currentCaseIndex]);

  const startGame = () => {
    setCurrentCaseIndex(0);
    setTotalNeuronsSaved(0);
    setGamePhase("playing");
  };

  const handleDecision = (choseToCall112: boolean) => {
    const currentCase = cases[currentCaseIndex];
    if (!currentCase) return;

    const correctlyCalled = choseToCall112 && currentCase.isStrokeCase;
    const correctlyIgnored = !choseToCall112 && !currentCase.isStrokeCase;
    const decisionCorrect = correctlyCalled || correctlyIgnored;
    setIsDecisionCorrect(decisionCorrect);

    let savedNeurons = 0;
    if (decisionCorrect) {
      if (currentCase.isStrokeCase) {
        savedNeurons = calculateNeuronsSaved(timer);
        setFeedbackMessage("✅ Richtig erkannt - Notruf war notwendig!");
        setFeedbackExplanation(
          `Die Person hatte eindeutige Schlaganfall-Symptome. Du hast in ${timer} Sekunden reagiert und ca. ${savedNeurons.toLocaleString("de-DE")} Neuronen gerettet.`,
        );
      } else {
        savedNeurons = calculateNeuronsSaved(0);
        setFeedbackMessage("✅ Richtig! Kein Notruf notwendig.");
        setFeedbackExplanation(
          "Diese Symptome deuteten nicht auf einen Schlaganfall hin.",
        );
      }
    } else {
      if (currentCase.isStrokeCase) {
        savedNeurons = 0;
        setFeedbackMessage("❌ Fehlentscheidung - Symptome nicht erkannt.");
        setFeedbackExplanation(
          `Das war keine gute Entscheidung - bei diesen Symptomen muss man sofort 112 rufen! Es gingen wertvolle Neuronen verloren.`,
        );
      } else {
        savedNeurons = calculateNeuronsSaved(timer);
        setFeedbackMessage("❌ Fehlentscheidung - Notruf war nicht notwendig.");
        setFeedbackExplanation(
          "Obwohl schnelles Handeln gut ist, deuteten diese Symptome nicht auf einen Schlaganfall hin. Ein unnötiger Notruf verbraucht Kapazitäten.",
        );
      }
    }

    setCurrentNeuronsSaved(savedNeurons);
    setTotalNeuronsSaved(
      (prev) =>
        prev + (currentCase.isStrokeCase && decisionCorrect ? savedNeurons : 0),
    );
    setGamePhase("feedback");
  };

  const nextCase = () => {
    if (currentCaseIndex < TOTAL_CASES - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
      setGamePhase("playing");
      setTimer(0);
    } else {
      setGamePhase("gameOver");
    }
  };

  const currentCaseData = cases[currentCaseIndex];

  if (gamePhase === "start") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">🧠 Time Is Brain!</h1>
          <p className="text-xl max-w-md">
            Erkenne Schlaganfall-Symptome und rette Leben. Jede Sekunde zählt!
          </p>
        </header>
        <main>
          <Button variant="default" size="xl" onClick={startGame}>
            Spiel starten
          </Button>
        </main>
      </div>
    );
  }

  if (gamePhase === "playing" && currentCaseData) {
    return (
      <div className="flex flex-col items-center justify-between min-h-screen p-4">
        <div className="w-full flex justify-between items-center p-4 rounded-xl mb-6 border-4">
          <div className="text-2xl font-semibold">
            ⏱️ Zeit: {String(Math.floor(timer / 60)).padStart(2, "0")}:
            {String(timer % 60).padStart(2, "0")}
          </div>
          <div className="text-2xl font-semibold">
            🧠 Gerettete Neuronen: {totalNeuronsSaved.toLocaleString("de-DE")}
          </div>
        </div>

        <Card className="w-full max-w-2xl text-center flex-grow flex flex-col items-center justify-center p-8 mb-6">
          <CardContent className="flex flex-col items-center justify-center">
            <img
              src={
                currentCaseData.patientImage ||
                "https://avatar.iran.liara.run/public/boy"
              }
              alt="Patient"
              className="w-48 h-48 rounded-full mb-6 border-4 border-rose-500 object-cover"
            />
            <CardTitle className="text-3xl font-bold mb-4 text-rose-500">
              Fall #{currentCaseIndex + 1}
            </CardTitle>
            <CardDescription className="text-xl text-gray-700 leading-relaxed">
              {currentCaseData.description}
            </CardDescription>
          </CardContent>
        </Card>

        <div className="w-full max-w-2xl mt-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => handleDecision(true)}
          >
            112 wählen
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleDecision(false)}
          >
            Ignorieren
          </Button>
        </div>
      </div>
    );
  }

  if (gamePhase === "feedback" && currentCaseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Card
          className={`w-full max-w-xl text-center ${isDecisionCorrect ? "border-green-500" : "border-red-500"}`}
        >
          <CardHeader>
            <CardTitle
              className={`text-4xl font-bold ${isDecisionCorrect ? "text-green-600" : "text-red-600"}`}
            >
              Ergebnis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl">{feedbackMessage}</p>
            <p className="text-lg text-gray-700">{feedbackExplanation}</p>
            {currentCaseData.isStrokeCase && isDecisionCorrect && (
              <p className="text-xl font-semibold text-rose-500">
                Du hast ca. {currentNeuronsSaved.toLocaleString("de-DE")}{" "}
                Neuronen gerettet!
              </p>
            )}
            {!isDecisionCorrect && currentCaseData.isStrokeCase && (
              <p className="text-xl font-semibold text-red-600">
                Keine Neuronen gerettet in diesem Fall.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={nextCase} size="xl" variant="default">
              {currentCaseIndex < TOTAL_CASES - 1
                ? "Nächster Fall"
                : "Ergebnisse anzeigen"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (gamePhase === "gameOver") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-xl text-center">
          <CardHeader>
            <CardTitle className="text-5xl font-bold">Spiel beendet!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-3xl">
              Du hast insgesamt{" "}
              <span className="font-bold text-rose-500">
                {totalNeuronsSaved.toLocaleString("de-DE")}
              </span>{" "}
              Neuronen gerettet.
            </p>
            <p className="text-xl leading-relaxed">
              In echten Notfällen zählt jede Sekunde. Erkenne die Symptome und
              handle! <br />
              Denke immer an den <strong>FAST-Test</strong>: <br />
              <strong>F</strong>ace (Gesicht), <strong>A</strong>rms (Arme),{" "}
              <strong>S</strong>peech (Sprache), <strong>T</strong>ime (Zeit -
              sofort 112).
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="default" size="xl" onClick={startGame}>
              Erneut spielen
            </Button>
          </CardFooter>
        </Card>
        <footer className="absolute bottom-8 text-center text-sm text-white text-opacity-80">
          <p>
            Denke daran: Dieses Spiel ist eine Vereinfachung. Im Zweifel immer
            den Notruf 112 wählen!
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Lade Spiel...</p>
    </div>
  );
}
