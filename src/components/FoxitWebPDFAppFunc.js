import React, { useEffect, useRef, useState } from "react";
import {
  PDFUIInstanceContext,
  PDFUIRenderToElementContext,
} from "./FoxitWebPDFContexts";
import * as UIExtension from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.full.js";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.css";
import * as Addons from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/uix-addons/allInOne.js";
import * as mobileAddons from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/uix-addons/allInOne.mobile.js";
import { licenseKey, licenseSN } from "../license-key";
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}
const FoxitWebPDFAppComponent = (props) => {
    const localPDFUpload = useRef()
    const [containerRef,] = useState(useRef())
    const [uploadedFile, setUploadedFile] = useState()
    const [uploadFileblob, setUploadedFileBlob] = useState()
    const [pdfui, setPdfui] = useState(null)

  const handleFileSelected = (e) => {
    console.log("uploadedFile",uploadedFile);
    console.log(e.target.files);
    setUploadedFile(e.target.files);
  };

  const OnNextStepHandler = () => {
    console.log("uploadedFile",uploadedFile);
    const blob = new Blob(uploadedFile, { type: "application/pdf" });
    console.log({blob});
    const createdURL = URL.createObjectURL(blob);
    console.log({createdURL});
    setUploadedFileBlob(blob);
    // DownloadFileFetch(blob)
  };

  useEffect(() => {
    if(uploadFileblob) {
        console.log("Here");
        pdfui.openPDFByFile(uploadFileblob, { fileName: "demo.pdf" });
        setPdfui(pdfui);
    }
  },[pdfui, uploadFileblob])

  useEffect(() => {
    if(uploadedFile) {
        console.log("HERE****");
        const libPath = "/foxit-lib/";
        const renderToElement = document.createElement("div");
        renderToElement.id = "pdf-ui";
        // const file = new File(["demo"], "demo.pdf", { type: "application/pdf" });
        let pdfui = new UIExtension.PDFUI({
          viewerOptions: {
            libPath,
            jr: {
              workerPath: libPath,
              enginePath: libPath + "/jr-engine/gsdk",
              fontPath: "/external/brotli",
              licenseSN,
              licenseKey,
            },
          },
          renderTo: renderToElement,
          addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile
            ? mobileAddons
            : Addons,
        });
        setPdfui(pdfui);
    }
    return pdfui?.destroy();
  },[pdfui, uploadedFile])

  //Using fetch
  const DownloadFileFetch = (blob) => {
    const libPath = "/foxit-lib/";
    const renderToElement = document.createElement("div");
    renderToElement.id = "pdf-ui";
    // const file = new File(["demo"], "demo.pdf", { type: "application/pdf" });
    let pdfui = new UIExtension.PDFUI({
      viewerOptions: {
        libPath,
        jr: {
          workerPath: libPath,
          enginePath: libPath + "/jr-engine/gsdk",
          fontPath: "/external/brotli",
          licenseSN,
          licenseKey,
        },
      },
      renderTo: renderToElement,
      addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile
        ? mobileAddons
        : Addons,
    });
    // const blob = new Blob([this.uploadedFile],{type: 'application/pdf'})
    // const createdURL = URL.createObjectURL(blob);
    // console.log({createdURL});

    pdfui.openPDFByFile(blob, { fileName: "demo.pdf" });
    setPdfui(pdfui);
    // fetch("http://localhost:3000/demo.pdf", {
    //   method: "GET",
    //   headers: { "Content-Type": "application/pdf" },
    // }).then((response) => {
    //   response.blob().then((myBlob) => {
    //     pdfui.openPDFByFile(myBlob, { fileName: "demo.pdf" });
    //     SetPdfui(pdfui);
    //   });
    // });
  };

//   componentDidUpdate() {
//     const pdfui = this.state.pdfui;
//     const container = this.state.containerRef.current;
//     if (pdfui && container) {
//       pdfui.renderTo.remove();
//       container.appendChild(pdfui.renderTo);
//     }
//   }
//   componentWillUnmount() {
//     if (this.state.pdfui) {
//       this.state.pdfui.destroy();
//     }
//   }

    return (
      <>
        <input
              type="file"
              ref={localPDFUpload}
              onChange={handleFileSelected} />
              <button onClick={() => OnNextStepHandler()}>Next</button>

        {uploadedFile && (
          <PDFUIRenderToElementContext.Provider value={containerRef}>
            {" "}
            {pdfui ? (
              <PDFUIInstanceContext.Provider value={pdfui}>
                {" "}
                {props.children}
              </PDFUIInstanceContext.Provider>
            ) : (
              props.children
            )}
          </PDFUIRenderToElementContext.Provider>
        )}
      </>
    )


}
export const FoxitWebPDFApp = React.memo(FoxitWebPDFAppComponent);
