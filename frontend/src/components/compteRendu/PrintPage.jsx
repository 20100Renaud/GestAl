import { forwardRef } from "react";

import ConsultationHeader from "./Header";
import ConsultationInfoBlocks from "./InfoBlocks";
import ConsultationContent from "./Content";
import ConsultationZonages from "./Zonages";

const ConsultationPrintPage = forwardRef(
  (
    {
      user,
      prestation,
      consultation,
      animal,
      proprietaire,
      lieu,
      zonages = [],
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-consultation-print
        className="box-border w-[794px] bg-white p-[53px] font-sans text-blue-900"
      >
        <ConsultationHeader
          prestation={prestation}
          animal={animal}
          consultation={consultation}
        />

        <ConsultationInfoBlocks
          user={user}
          proprietaire={proprietaire}
          lieu={lieu}
          prestation={prestation}
        />

        <ConsultationContent consultation={consultation} />

        <ConsultationZonages zonages={zonages} />
      </div>
    );
  },
);

ConsultationPrintPage.displayName = "CompteRenduPrintPage";

export default ConsultationPrintPage;
