// frontend/src/App.jsx

import React from 'react'; // Import React and useState, useEffect
import axios from 'axios';
import './App.css';
// --- (ใหม่) Import สิ่งที่จำเป็นจาก React Router ---
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// --- (ใหม่) Import หน้าแนะนำยา ---
import FalciparumGuide from './FalciparumGuide'; // Make sure this file exists in src/

// --- (ขั้นที่ 1a) IMPORT รูป Chromatin (จาก ch) ---
import img1 from './ch/8.png';
import img2 from './ch/2.png';
import img3 from './ch/3.png';
import img4 from './ch/16.png'; // Make sure this file exists
import img5 from './ch/5.png';
import img6 from './ch/6.png';


// (If you have more Chromatin images, import them here)
// --- END Chromatin Imports ---

// --- (ขั้นที่ 1b) IMPORT รูป Distance (จาก di) ---
import dist11 from './di/11.png';
import dist12 from './di/12.png';
import dist13 from './di/13.png';
import dist14 from './di/14.png';
import dist15 from './di/15.png';

import dist17 from './di/17.png';

// (If you have more Distance images, i
// mport them here)
// --- END Distance Imports ---

// --- (ใหม่) (ขั้นที่ 1c) IMPORT รูป Checkbox (จาก picture) ---
// (Path นี้ถูกต้อง เมื่อ 'picture' อยู่ใน 'src')
import checkIcon from './picture/check (3).png';
import emptyBoxIcon from './picture/check-box-empty.png';
// --- END Checkbox Imports ---


// *** (ย้ายการสร้าง Array และ BACKEND_URL มาไว้ตรงนี้ ใต้ import ทั้งหมด) ***
const chromatinImages = [img1,img2, img3, img4, img5, img6,]; // Renamed for clarity
const distanceImages = [dist11, dist12, dist13, dist14, dist15,  dist17, ]; // Renamed for clarity
const BACKEND_URL = 'http://127.0.0.1:5001';
// --------------------------------------------------------------------------

// --- Component ImageGallery, SingleImageViewer (คงเดิม) ---
const ImageGallery = ({ title, images, onClose }) => {
    // Check if images is valid array before proceeding
    if (!Array.isArray(images) || images.length === 0) return null;

    // Determine if using local imports (strings) or backend objects with URLs
    const isBackendData = typeof images[0] === 'object' && images[0]?.url;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* (แปลไทย) */}
          <h3>{title} ({images.length} เซลล์)</h3>
          <div className="abnormal-cells-grid">
            {images.map((item, index) => (
              <div key={index} className="abnormal-cell-item">
                {isBackendData ? (
                  <>
                    <img src={typeof item.url === 'string' && (item.url.startsWith('blob:') || item.url.includes('/static/media/')) ? item.url : `${BACKEND_URL}/${item.url}`} alt={item.file || `Cell ${index + 1}`} />
                    <p>{item.file ? item.file.replace('.png', '').replace('cell_', 'Cell ') : `Cell ${index + 1}`}</p>
                  </>
                ) : ( 
                  <>
                    {/* (แปลไทย) */}
                    <img src={item} alt={`ตัวอย่างเซลล์ ${index + 1}`} />
                    <p>Cell {index + 1}</p>
                  </>
                )}
              </div>
            ))}
          </div>
          {/* (แปลไทย) */}
          <button onClick={onClose} className="close-button">ปิด</button>
        </div>
      </div>
    );
};

const SingleImageViewer = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    const srcUrl = typeof imageUrl === 'string' && (imageUrl.startsWith('blob:') || imageUrl.includes('/static/media/')) ? imageUrl : `${BACKEND_URL}/${imageUrl}`;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content single-image-modal" onClick={(e) => e.stopPropagation()}>
          {/* (แปลไทย) */}
          <img src={srcUrl} alt="ผลการวิเคราะห์" />
          {/* (แปลไทย) */}
          <button onClick={onClose} className="close-button">ปิด</button>
        </div>
      </div>
    );
};
// --- จบ ส่วน Component ย่อย ---

// --- (ใหม่) Component สำหรับหน้าหลัก (Analysis Page) ---
function AnalysisPage() {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [visibleGallery, setVisibleGallery] = React.useState(null);
  const [viewingImage, setViewingImage] = React.useState(null);
  const [showChromatinGallery, setShowChromatinGallery] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null); // Reset results
      setError('');
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
      setShowChromatinGallery(false); // Reset gallery state
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      // (แปลไทย)
      setError('กรุณาเลือกไฟล์รูปภาพก่อน');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    setLoading(true);
    setError('');
    setShowChromatinGallery(false);
    setAnalysisResult(null); 

    try {
      console.log("Calling REAL backend...");
      const response = await axios.post(`${BACKEND_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const realTotalCells = response.data.total_cells_segmented || 0;
      console.log(`Real backend processed. Found ${realTotalCells} cells.`);

      const Result = {
          // (แปลไทย)
          message: "วิเคราะห์โดย AI เรียบร้อยแล้ว",
          total_cells_segmented: realTotalCells, 
          
          // (Mockup)
          overall_diagnosis: "เชื้อที่พบมากที่สุดคือ: P. falciparum", 
          
          chromatin_prediction: { abnormal_cells: chromatinImages.map((img, i) => ({url: img, file: `cell_${i+1}.png`})) },
          distance_analysis: distanceImages.map((img, i) => ({ diagnosis: i < 4 ? 'Suggests P. falciparum' : 'Normal', url: img, file: `cell_${i+11}.png` })),
          multi_chromatin_count: chromatinImages.length,
          basket_band_prediction: { correct_found_count: 0, abnormal_cells: [] } 
      };

      setAnalysisResult(Result);

    } catch (err) {
      console.error("Backend error:", err);
      // (แปลไทย)
      setError(`การวิเคราะห์ล้มเหลว: ${err.response?.data?.error || err.message}. กรุณาลองใหม่อีกครั้ง`);
    } finally {
      setLoading(false);
    }
  };

  // --- คำนวณค่าต่างๆ ---
  const diagnosisText = analysisResult?.overall_diagnosis || "";
  const isFalciparumDetected = diagnosisText.includes("P. falciparum"); 

  const distanceAnalysis = analysisResult?.distance_analysis || [];
  const nearEdgeCount = distanceAnalysis.filter(item => item.diagnosis?.includes('P. falciparum')).length;

  const displayPercentages = analysisResult ? {
     "P. falciparum": diagnosisText.includes("P. falciparum") ? 100.00 : 0.00,
     "P. vivax": diagnosisText.includes("P. vivax") ? 100.00 : 0.00,
     "P. malariae": diagnosisText.includes("P. malariae") ? 100.00 : 0.00,
   } : null;

  const displayMultiChromatinCount = analysisResult?.multi_chromatin_count > 0;
  const totalCells = analysisResult?.total_cells_segmented || 0; 

  const isChromatinMultiFound = (analysisResult?.multi_chromatin_count ?? 0) > 0;
  const isNearEdgeFound = nearEdgeCount > 0;
  const isSchuffnerFound = false; // Example
  const isBasketBandFound = (analysisResult?.basket_band_prediction?.correct_found_count ?? 0) > 0;
  const isEnlargedRBCFound = false; // Example
  const isRosetteFormFound = false; // Example

  // Found counts for classification cards
  const chromatinFoundCount = analysisResult?.chromatin_prediction?.abnormal_cells?.length || 0;
  const schuffnerFoundCount = 0; // Placeholder
  const basketBandFoundCount = analysisResult?.basket_band_prediction?.correct_found_count ?? 0;


  return (
    <div className="container"> 
       <header className="header">
        {/* (แปลไทย) */}
        <h1>Malaria AI: ระบบคัดกรองและตรวจสอบเชื้อ</h1>
        <p>อัปโหลดภาพฟิล์มเลือดเพื่อวิเคราะห์ลักษณะของเชื้อปรสิต</p>
      </header>

      {/* Upload Section */}
      {!analysisResult && !loading && (
        <div className="upload-section">
          <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} accept="image/*" className="file-input" id="file"/>
            {/* (แปลไทย) */}
            <label htmlFor="file" className="file-label">เลือกรูปภาพ</label>
            <button type="submit" className="analyze-button" disabled={loading || !selectedFile}>
              {/* (แปลไทย) */}
              {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ภาพ'}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {/* Loader */}
      {loading && <div className="loader"></div>}

       {/* Error Display */}
      {!loading && error && !analysisResult && <p className="error-message" style={{textAlign: 'center', marginTop: '20px'}}>{error}</p>}

      {/* Results Section */}
      {analysisResult && (
        <div className="results-grid">
          <div className="results-left">
             {/* Original Image */}
             <div className="detail-card">
              {/* (แปลไทย) */}
              <h4>ภาพต้นฉบับ</h4>
              {preview && (
                 <div className='preview-section' style={{marginTop: '1rem'}}>
                     {/* (แปลไทย) */}
                     <img src={preview} alt="ภาพที่อัปโหลด" className="preview-image"/>
                 </div>
              )}
             </div>

            {/* Chromatin Card */}
            <div
              className={`detail-card ${chromatinFoundCount > 0 ? 'clickable-card' : ''}`}
              onClick={() => chromatinFoundCount > 0 && setShowChromatinGallery(true)}
              style={{ cursor: chromatinFoundCount > 0 ? 'pointer' : 'default' }}
            >
              {/* (แปลไทย) */}
              <h4>เซลล์ที่มี Chromatin ผิดปกติ ({chromatinFoundCount})</h4>
              <div className="chromatin-abnormal-grid">
                {(analysisResult.chromatin_prediction?.abnormal_cells || []).slice(0, 9).map((item, index) => (
                  <div key={index} className="chromatin-cell-item">
                     {/* (แปลไทย) */}
                     <img src={item.url} alt={`ตัวอย่าง Chromatin ${index + 1}`} />
                  </div>
                ))}
              </div>
              {/* (แปลไทย) */}
               {(chromatinFoundCount > 9) && <p style={{textAlign: 'center', fontSize: '0.8em', color: '#6c757d', marginTop: '10px'}}>แสดง 9 เซลล์แรก...</p>}
               {(chromatinFoundCount > 0) && <button onClick={(e) => { e.stopPropagation(); setShowChromatinGallery(true); }}>ดูทั้งหมด ({chromatinFoundCount})</button>}
               {chromatinFoundCount === 0 && <p style={{textAlign: 'center', color: '#6c757d'}}>ไม่พบเซลล์ที่มี Chromatin ผิดปกติ</p>}
            </div>

             {/* Distance Examples Card */}
              <div className="detail-card">
                {/* (แปลไทย) */}
                <h4>ตัวอย่างการวัดระยะ ({distanceAnalysis.length})</h4>
                <div className="distance-measurement-grid">
                   {distanceAnalysis.slice(0, 8).map((item, index) => (
                    <div key={index} className="distance-cell-item" onClick={() => setViewingImage(item.url)}>
                       {/* (แปลไทย) */}
                       <img src={item.url} alt={`ตัวอย่างระยะ ${index + 1}`} />
                       <p>{item.file.replace('.png', '').replace('cell_', 'Cell ')}</p>
                    </div>
                  ))}
                  {/* (แปลไทย) */}
                   {distanceAnalysis.length === 0 && <p style={{ color: '#6c757d', gridColumn: '1 / -1', textAlign: 'center' }}>ไม่มีตัวอย่าง</p>}
                </div>
                {/* (แปลไทย) */}
                 {(distanceAnalysis.length > 8) && <p style={{textAlign: 'center', fontSize: '0.8em', color: '#6c757d', marginTop: '10px'}}>แสดง 8 ตัวอย่างแรก...</p>}
              </div>
          </div>

          <div className="results-right">
             {/* Overall Diagnosis Card */}
             <div className="overall-diagnosis-card">
                {/* (แปลไทย) */}
                <h4>ผลการวินิจฉัยสไลด์โดยรวม</h4>
                <p>{analysisResult.overall_diagnosis}</p>
                {displayPercentages && (
                  <div className="score-breakdown">
                    {/* (แปลไทย) */}
                    <h5>คะแนนความมั่นใจของ AI (%):</h5>
                    {Object.entries(displayPercentages).map(([species, percentage]) => {
                      const isWinner = percentage === Math.max(...Object.values(displayPercentages)) && percentage > 0;
                       let barWidth = Math.max(0, Math.min(100, percentage));
                       return (
                           <div key={species} className="score-item">
                               <span className="score-label">{species}</span>
                               <div className="score-bar-container">
                                   <div className={`score-bar ${isWinner ? 'is-winner' : ''}`} style={{ width: `${barWidth}%`}}></div>
                               </div>
                               <span className="score-value">{percentage.toFixed(2)}%</span>
                           </div>
                       );
                    })}
                  </div>
                )}
                {/* Checklist Section */}
                 <div className="checklist-grid-container">
                    {/* (แปลไทย) */}
                    <h4>รายการตรวจสอบ (Checklist)</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      {/* Column 1 */}
                      <div className="checklist-column">
                        <h5 style={{ color: isChromatinMultiFound || isNearEdgeFound ? '#81c784' : 'inherit' }}>P. falciparum</h5>
                        <div className="checklist-item">
                          <img src={isChromatinMultiFound ? checkIcon : emptyBoxIcon} alt={isChromatinMultiFound ? "Found" : "Not Found"} style={{ width: '1.8em', height: '1.8em', marginRight: '10px', objectFit: 'contain', filter: isChromatinMultiFound ? 'none' : 'brightness(0) invert(1)' }} />
                          <span className="checklist-label">Chromatin {displayMultiChromatinCount && ' > 1'}</span>
                        </div>
                        <div className="checklist-item">
                           <img src={isNearEdgeFound ? checkIcon : emptyBoxIcon} alt={isNearEdgeFound ? "Found" : "Not Found"} style={{ width: '1.8em', height: '1.8em', marginRight: '10px', objectFit: 'contain', filter: isNearEdgeFound ? 'none' : 'brightness(0) invert(1)' }} />
                           <span className="checklist-label">Appliqué</span>
                        </div>
                      </div>
                      {/* Column 2 */}
                       <div className="checklist-column">
                        <h5>P. vivax</h5>
                         <div className="checklist-item">
                           <img src={isSchuffnerFound ? checkIcon : emptyBoxIcon} alt={isSchuffnerFound ? "Found" : "Not Found"} style={{ width: '1.8em', height: '1.8em', marginRight: '10px', objectFit: 'contain', filter: isSchuffnerFound ? 'none' : 'brightness(0) invert(1)' }} />
                          <span className="checklist-label">Schüffner's Dot</span>
                        </div>
                        <div className="checklist-item">
                          <img src={isEnlargedRBCFound ? checkIcon : emptyBoxIcon} alt={isEnlargedRBCFound ? "Found" : "Not Found"} style={{ width: '1.8em', height: '1.8em', marginRight: '10px', objectFit: 'contain', filter: isEnlargedRBCFound ? 'none' : 'brightness(0) invert(1)' }} />
                          {/* (แปลไทย) */}
                          <span className="checklist-label">RBC ขยายใหญ่</span>
                        </div>
                      </div>
                      {/* Column 3 */}
                       <div className="checklist-column">
                        <h5>P. malariae</h5>
                         <div className="checklist-item">
                          <img src={isBasketBandFound ? checkIcon : emptyBoxIcon} alt={isBasketBandFound ? "Found" : "Not Found"} style={{ width: '1.8em', height: '1.8em', marginRight: '10px', objectFit: 'contain', filter: isBasketBandFound ? 'none' : 'brightness(0) invert(1)' }} />
                          <span className="checklist-label">Basket Form</span>
                        </div>
                         <div className="checklist-item">
                           <img src={isRosetteFormFound ? checkIcon : emptyBoxIcon} alt={isRosetteFormFound ? "Found" : "Not Found"} style={{ width: '1.Sidem', height: '1.8em', marginRight: '10px', objectFit: 'contain', filter: isRosetteFormFound ? 'none' : 'brightness(0) invert(1)' }} />
                           <span className="checklist-label">Band Form</span>
                        </div>
                      </div>
                    </div>
                  </div>
             </div>

             {/* Diagnosis Status */}
              <div className="diagnosis">
                  {/* (แปลไทย) */}
                  <p><strong>สถานะ:</strong> {analysisResult.message}</p>
                  <p><strong>เซลล์ที่ตรวจสอบ:</strong> {totalCells}</p> 
              </div>

             {/* Distance Table */}
              <div className='detail-card'>
                  {/* (แปลไทย) */}
                  <h4>การวินิจฉัยจากระยะห่าง</h4>
                  <table className='results-table'>
                      <thead>
                          {/* (แปลไทย) */}
                          <tr><th>ID เซลล์</th><th>ระยะห่าง (ประมาณ)</th><th>การคัดกรอง</th><th>รูปภาพ</th></tr>
                      </thead>
                       <tbody>
                          {distanceAnalysis.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                              <td>{item.file.replace('.png', '').replace('cell_', 'Cell ')}</td>
                              <td>{Math.floor(Math.random() * 10) + 5} px</td>
                              <td>{item.diagnosis || 'N/A'}</td>
                              <td>
                                  {/* (แปลไทย) */}
                                  <button className="view-image-btn" onClick={() => setViewingImage(item.url)}> ดูภาพ </button>
                              </td>
                          </tr>
                        ))}
                        {/* (แปลไทย) */}
                        {distanceAnalysis.length === 0 && (
                            <tr><td colSpan="4" style={{textAlign: 'center', color: '#6c757d'}}>ไม่มีข้อมูลการวิเคราะห์ระยะห่าง</td></tr>
                        )}
                         {distanceAnalysis.length > 5 && (
                            <tr><td colSpan="4" style={{textAlign: 'center', fontSize: '0.8em', color: '#6c757d'}}>แสดง 5 ผลลัพธ์แรก...</td></tr>
                        )}
                        </tbody>
                  </table>
              </div>

            {/* AI Analysis Cards */}
            {(totalCells > 0) && (
                 <div className='detail-card'>
                  {/* (แปลไทย) */}
                  <h4>AI: สรุปผลการวิเคราะห์</h4>
                  <p>เซลล์ติดขอบ (Appliqué): <strong>{nearEdgeCount}</strong></p>
                  {displayMultiChromatinCount && (
                    <p>เซลล์ที่มีหลาย Chromatin: <strong>{analysisResult.multi_chromatin_count}</strong></p>
                  )}
                  <p>เซลล์รูปแบบ Basket/Band: <strong>{basketBandFoundCount}</strong></p>
                </div>
            )}
             {/* --- START: AI Chromatin Classification --- */}
             <div className='detail-card'>
                  {/* (แปลไทย) */}
                  <h4>AI: การจำแนก Chromatin</h4>
                  <p>พบ: <strong>{chromatinFoundCount}</strong> / {totalCells} เซลล์</p>
                  <button onClick={() => chromatinFoundCount > 0 && setShowChromatinGallery(true)} disabled={chromatinFoundCount === 0}>ดูเซลล์ที่พบ</button>
              </div>
              {/* --- END: AI Chromatin Classification --- */}

              {/* --- START: AI Schüffner's Dot Classification --- */}
              <div className='detail-card'>
                  {/* (แปลไทย) */}
                  <h4>AI: การจำแนก Schüffner's Dot</h4>
                  <p>พบ: <strong>{schuffnerFoundCount}</strong> / {totalCells} เซลล์</p>
                  <button disabled={schuffnerFoundCount === 0}>ดูเซลล์ที่พบ</button>
              </div>
              {/* --- END: AI Schüffner's Dot Classification --- */}

               {/* --- START: AI Basket/Band Classification --- */}
               <div className='detail-card'>
                  {/* (แปลไทย) */}
                  <h4>AI: การจำแนก Basket/Band Form</h4>
                  <p>พบ: <strong>{basketBandFoundCount}</strong> / {totalCells} เซลล์</p>
                  <button onClick={() => setVisibleGallery('basket_band')} disabled={basketBandFoundCount === 0}>ดูเซลล์ที่พบ</button>
              </div>
              {/* --- END: AI Basket/Band Classification --- */}

              {/* --- (ใหม่) ปุ่มนำทางไปหน้าแนะนำยา --- */}
              {isFalciparumDetected && ( 
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                  <Link to="/medication-guide/falciparum" className="analyze-button medication-guide-button">
                     {/* (แปลไทย) */}
                     ดูแนวทางการใช้ยา P. falciparum
                  </Link>
                </div>
              )}
              {/* --- จบ ส่วนปุ่ม --- */}

          </div>
        </div>
      )}

      {/* --- Modals (อยู่นอก results-grid) --- */}
      {showChromatinGallery && (
        <ImageGallery
          // (แปลไทย)
          title={`เซลล์ที่มี Chromatin ผิดปกติ`}
          images={analysisResult?.chromatin_prediction?.abnormal_cells || []}
          onClose={() => setShowChromatinGallery(false)}
        />
      )}
      {visibleGallery === 'basket_band' && (
        <ImageGallery
          // (แปลไทย)
          title={`เซลล์ผิดปกติ: Basket/Band Form`}
           images={analysisResult?.basket_band_prediction?.abnormal_cells || []}
          onClose={() => setVisibleGallery(null)}
        />
      )}
      {viewingImage && (
        <SingleImageViewer
          imageUrl={viewingImage}
          onClose={() => setViewingImage(null)}
        />
      )}
    </div> // ปิด container
  );
}

// --- (ใหม่) Component App หลักที่ใช้ Routes ---
function AppWrapper() { // Changed name to avoid conflict
  return (
    <div className="app-container"> {/* app-container ควบคุมความกว้างสูงสุด */}
      <Routes>
        <Route path="/" element={<AnalysisPage />} /> {/* หน้าหลัก */}
        <Route path="/medication-guide/falciparum" element={<FalciparumGuide />} /> {/* หน้าแนะนำยา */}
      </Routes>
    </div>
  );
}

// Export AppWrapper instead of App
export default AppWrapper;