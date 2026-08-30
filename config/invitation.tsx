import type { BuiltinStep } from "@/components/screens";

export const BACKGROUND = "/img/background.webp";
export const BACKGROUND_DIM = 0.15;

const PHOTO = "/img/house.png";

/**
 * Example flow for a party invitation.
 */
export const invitation: BuiltinStep[] = [
  {
    id: "boot",
    type: "boot",
    brand: "NOKIA",
    model: "3310",
    label: "connecting",
  },
  {
    id: "alert",
    type: "notice",
    icon: "envelope",
    title: "1 new message",
    hint: "Press the blue key",
    chime: true,
  },
  {
    id: "intro",
    type: "chat",
    from: "tiesvdp",
    messages: [
      { text: "Sup!" },
      { text: "I'm having people over next month." },
      { text: "Here's it at:" },
    ],
    autoAdvanceMs: 1500,
  },
  {
    id: "place",
    type: "photo",
    src: PHOTO,
    alt: "My place",
  },
  {
    id: "name",
    type: "text",
    label: "YOUR NAME",
    prompt: "Who's coming?",
    maxLength: 60,
    emptyMessage: "Type your name first",
  },
  {
    id: "guests",
    type: "select",
    label: "PLUS ONE",
    prompt: "Bringing anyone?",
    options: [
      { label: "Just me", value: "solo" },
      { label: "Plus one", value: "plus-one" },
    ],
    defaultValue: "solo",
  },
  {
    id: "nights",
    type: "multiSelect",
    label: "WHICH NIGHT?",
    prompt: "Pick what suits:",
    hint: "as many as you like",
    min: 1,
    minMessage: "Pick at least one night",
    options: [
      { label: "Fri 12 Sep", value: "2027-09-12" },
      { label: "Sat 13 Sep", value: "2027-09-13" },
      { label: "Fri 19 Sep", value: "2027-09-19" },
      { label: "Sat 20 Sep", value: "2027-09-20" },
      { label: "Fri 26 Sep", value: "2027-09-26" },
      { label: "Sat 27 Sep", value: "2027-09-27" },
    ],
  },
  {
    id: "done",
    type: "confirm",
    label: "MESSAGE",
    renderDone: (answers) => (
      <>
        <div className="text-[7cqw]">[!!!]</div>
        <div className="text-[5.5cqw] font-bold uppercase">
          Thanks {String(answers.name || "friend")}
        </div>
        <div className="text-[3.5cqw] opacity-80">See you there!</div>
      </>
    ),
  },
];
