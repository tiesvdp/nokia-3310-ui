"use client";

import { Background } from "@/components/Background";
import { PhoneFlow } from "@/components/PhoneFlow";
import { nokia3310 } from "@/config/skin";
import { BACKGROUND, BACKGROUND_DIM, invitation } from "@/config/invitation";

export default function Home() {
  return (
    <Background src={BACKGROUND} dim={BACKGROUND_DIM}>
      <main className="h-dvh w-full">
        <PhoneFlow
          skin={nokia3310}
          flow={invitation}
          onSubmit={async (answers) => {
            // Replace this with your own handler
            console.log(answers);
            await new Promise((resolve) => setTimeout(resolve, 900));
          }}
        />
      </main>
    </Background>
  );
}
