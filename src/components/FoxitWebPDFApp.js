import React from "react";
import {
  PDFUIInstanceContext,
  PDFUIRenderToElementContext,
} from "./FoxitWebPDFContexts";
import * as UIExtension from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.full.js";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.css";
import * as Addons from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/uix-addons/allInOne.js";
import * as mobileAddons from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/uix-addons/allInOne.mobile.js";
import { licenseKey, licenseSN } from "../license-key";
import axios from "axios";
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}
class FoxitWebPDFAppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.localPDFUpload = React.createRef();
    this.state = {
      containerRef: React.createRef(),
      uploadedFile: null,
      uploadFileBlob: null,
    };
  }

  handleFileSelected = (e) => {
    this.setState({ uploadedFile: e.target.files });
  };

  OnNextStepHandler = () => {
    const blob = new Blob(this.state.uploadedFile, { type: "application/pdf" });
    this.setState({ uploadFileBlob: blob });
    this.DownloadFileFetch(blob);
  };

  //Using fetch
  DownloadFileFetch = (blob) => {
    const libPath = "/foxit-lib/";
    const renderToElement = document.createElement("div");
    renderToElement.id = "pdf-ui";

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

    pdfui.openPDFByFile(blob, { fileName: "demo.pdf" });
    this.setState({
      pdfui: pdfui,
    });
    // fetch("http://localhost:3000/demo.pdf", {
    //   method: "GET",
    //   headers: { "Content-Type": "application/pdf" },
    // }).then((response) => {
    //   response.blob().then((myBlob) => {
    //     pdfui.openPDFByFile(myBlob, { fileName: "demo.pdf" });
    //     this.setState({
    //       pdfui,
    //     });
    //   });
    // });
  };

  async example(pdfDoc) {
    let bufferArray = [];
    let blob;
    await pdfDoc
      .getStream(function ({ arrayBuffer, offset, size }) {
        bufferArray.push(arrayBuffer);
      })
      .then(function (size) {
        console.log("The total size of the stream", size);
        blob = new Blob(bufferArray, { type: "application/pdf" });
        console.log({blob});
        const URLs = URL.createObjectURL(blob);
        console.log({ URLs });
      });
    this.pdfPostDataFileHandler(blob);
  }

  pdfPostDataFileHandler = async (blob) => {
    console.log("Hello");
    // const file = this.state.uploadedFile[0];
    const formData = new FormData();
    formData.append("pdfFile", blob);
    // const pdfFile = blob

    // const formData = new Blob([file], { type: 'application/pdf' });

    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
    console.log("002");
  };

  documentSaveHandler = () => {
    // this.state.pdfui.getPDFViewer().then((pdf) => {
    //   // console.log(pdf.getPDFDocRender().getPDFDoc().getStream());
    //   console.log(pdf);
    // });

    console.log(this.state.pdfui.getCurrentPDFDoc().then((pdf) => {
      console.log({pdf});
    }));

    this.state.pdfui.getPDFViewer().then((pdf) => {
      // console.log(pdf.getPDFDocRender().getPDFDoc().getStream());
      console.log({pdf});
      this.example(pdf.getPDFDocRender().getPDFDoc());
    });
  };

  //function create --- called directly to save button
  // componentDidMount() {
  //   console.log("here");
  // }

  render() {
    return (
      <>
        {" "}
        <input
          type="file"
          ref={this.localPDFUpload}
          onChange={this.handleFileSelected}
        />{" "}
        <button onClick={() => this.OnNextStepHandler()}>Next</button>{" "}
        {this.state.pdfui && (
          <button onClick={() => this.documentSaveHandler()}>Save</button>
        )}
        {this.state.pdfui && (
          <PDFUIRenderToElementContext.Provider value={this.state.containerRef}>
            {" "}
            {this.state.pdfui ? (
              <PDFUIInstanceContext.Provider value={this.state.pdfui}>
                {" "}
                {this.props.children}
              </PDFUIInstanceContext.Provider>
            ) : (
              this.props.children
            )}
          </PDFUIRenderToElementContext.Provider>
        )}
      </>
    );
  }
  componentDidUpdate(prevProps, prevState) {
    const pdfui = this.state.pdfui;
    const container = this.state.containerRef.current;
    if (pdfui && container) {
      pdfui.renderTo.remove();
      container.appendChild(pdfui.renderTo);
    }
  }

  componentWillUnmount() {
    if (this.state.pdfui) {
      this.state.pdfui.destroy();
    }
  }
}
export const FoxitWebPDFApp = React.memo(FoxitWebPDFAppComponent);
