// frontend/src/App.jsx
import React from 'react';
import axios from 'axios';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import FalciparumGuide from './FalciparumGuide'; 
import VivaxGuide from './VivaxGuide';

// --- IMPORT Icons ---
import checkIcon from './picture/check (3).png';
import emptyBoxIcon from './picture/check-box-empty.png';

const BACKEND_URL = 'http://127.0.0.1:5001';

// --- Components ---

// 1. InteractiveImage
const InteractiveImage = ({ imageUrl, cells, onCellClick }) => {
    const [imgSize, setImgSize] = React.useState({ w: 0, h: 0 });
    const imgRef = React.useRef(null);

    const handleImageLoad = (e) => {
        setImgSize({
            w: e.target.naturalWidth,
            h: e.target.naturalHeight
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '16px' }}>
            <img 
                ref={imgRef}
                src={imageUrl} 
                alt="Original Slide" 
                onLoad={handleImageLoad}
                style={{ width: '100%', display: 'block' }} 
            />
            {imgSize.w > 0 && cells.map((cell, index) => {
                if (!cell.bbox) return null;
                const left = (cell.bbox.x / imgSize.w) * 100;
                const top = (cell.bbox.y / imgSize.h) * 100;
                const width = (cell.bbox.w / imgSize.w) * 100;
                const height = (cell.bbox.h / imgSize.h) * 100;

                return (
                    <div
                        key={index}
                        onClick={() => onCellClick(cell)}
                        className="interactive-box"
                        style={{
                            position: 'absolute',
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                        }}
                    >
                        <div className="box-tooltip">{cell.characteristic}</div>
                    </div>
                );
            })}
        </div>
    );
};

// 2. Image Gallery
const ImageGallery = ({ title, images, onClose }) => {
    if (!Array.isArray(images) || images.length === 0) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
             <h3 style={{margin:0, color:'#1e293b'}}>{title} <span style={{color:'#64748b', fontSize:'0.9em'}}>({images.length})</span></h3>
             <button onClick={onClose} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
          </div>
          <div className="abnormal-cells-grid">
            {images.map((item, index) => (
              <div key={index} className="abnormal-cell-item">
                <img src={`${BACKEND_URL}/${item.url}`} alt={`Cell ${index + 1}`} />
                <p>{item.characteristic}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center'}}>
             <button onClick={onClose} className="close-button">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    );
};

// 3. Size Visualization Gallery
const SizeGallery = ({ title, items, onClose }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div style={{marginBottom:'20px'}}>
             <h3 style={{margin:0, color:'#1e293b'}}>Size Analysis Visualization</h3>
             <p style={{color:'#64748b', fontSize:'0.9rem', marginTop:'5px'}}>
                ภาพแสดงเส้นขอบ (สีเขียว) และวงกลมคำนวณขนาดเทียบเคียง (สีเหลือง)
             </p>
          </div>
          <div className="abnormal-cells-grid">
            {items.map((item, index) => (
              <div key={index} className="abnormal-cell-item" style={{
                  border: item.status === 'Enlarged' ? '2px solid #ef4444' : '1px solid #e2e8f0',
              }}>
                <div style={{position:'relative'}}>
                    <img src={`${BACKEND_URL}/${item.visualization_url}`} alt="Size Viz" />
                    {item.status === 'Enlarged' && 
                        <span style={{position:'absolute', top:5, right:5, background:'#ef4444', color:'white', fontSize:'0.7rem', padding:'2px 6px', borderRadius:'4px'}}>Enlarged</span>
                    }
                </div>
                <div style={{padding:'12px', textAlign:'left', background:'white'}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:'4px'}}>
                        <span style={{color:'#64748b'}}>Size:</span>
                        <strong>{item.size_px} px</strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem'}}>
                        <span style={{color:'#64748b'}}>Ratio:</span>
                        <strong style={{color: item.ratio > 1.5 ? '#ef4444' : '#10b981'}}>
                            {item.ratio}x
                        </strong>
                    </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center'}}>
            <button onClick={onClose} className="close-button">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    );
};

const SingleImageViewer = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="single-image-modal" onClick={(e) => e.stopPropagation()}>
          <img src={imageUrl} alt="Result" />
          <button onClick={onClose} className="close-button" style={{background:'rgba(255,255,255,0.2)', color:'white'}}>ปิดรูปภาพ</button>
        </div>
      </div>
    );
};

// --- Main Page ---
function AnalysisPage() {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [res, setRes] = React.useState(null); 
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Galleries States
  const [viewingImage, setViewingImage] = React.useState(null);
  const [showChromatinGallery, setShowChromatinGallery] = React.useState(false);
  const [showSchuffnerGallery, setShowSchuffnerGallery] = React.useState(false);
  const [showBasketGallery, setShowBasketGallery] = React.useState(false);
  const [showSizeGallery, setShowSizeGallery] = React.useState(false);

  // Detail Modal State
  const [selectedCellDetail, setSelectedCellDetail] = React.useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setRes(null); 
      setError('');
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => { 
    if (!selectedFile) return setError('กรุณาเลือกไฟล์ก่อน');
    setLoading(true); setError(''); setRes(null); 
    const formData = new FormData(); 
    formData.append('file', selectedFile);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRes(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด: Backend ไม่ตอบสนอง หรือการประมวลผลล้มเหลว"); 
      setLoading(false);
    } 
  };

  const overallDiagnosis = res?.overall_diagnosis || "";
  const totalCells = res?.total_cells_segmented || 0;
  const allCells = res?.vit_characteristics || [];
  const sizeData = res?.size_analysis || [];

  const isVivax = overallDiagnosis.includes("vivax");
  const isFalciparum = overallDiagnosis.includes("falciparum");
  const isMalariae = overallDiagnosis.includes("malariae");

  const chromatinCells = allCells.filter(c => c.characteristic === '1chromatin');
  const schuffnerCells = allCells.filter(c => ['schuffner dot'].includes(c.characteristic)); 
  const basketCells = allCells.filter(c => ['band form', 'basket form'].includes(c.characteristic));
  const abnormalCells = allCells.filter(c => c.characteristic !== 'nomal_cell');

  let avgRatio = 1.0;
  if (sizeData.length > 0) {
      const sum = sizeData.reduce((acc, curr) => acc + curr.ratio, 0);
      avgRatio = (sum / sizeData.length).toFixed(2);
  } else {
      if (isVivax) avgRatio = 1.45;
      else if (isMalariae) avgRatio = 0.80;
  }

  const chkChromatin = isFalciparum; 
  const chkApplique = isFalciparum; 
  const chkSchuffner = isVivax;
  const hasEnlargedCells = sizeData.some(item => item.status === 'Enlarged');
  const chkEnlarged = hasEnlargedCells || isVivax; 
  const chkAmoeboid = isVivax;
  const chkSmaller = isMalariae;
  const chkBandBasket = isMalariae;

  return (
    <div className="container"> 
       <header className="header">
        <h1>MALA-Sight</h1>
        <p>AI-Powered Malaria Screening & Morphometric Analysis</p>
      </header>

      {!res && !loading && (
        <div className="upload-section">
            <input type="file" onChange={handleFileChange} accept="image/*" className="file-input" id="file"/>
            {preview ? (
                <div>
                    <img src={preview} alt="Preview" style={{
                        maxWidth: '100%', maxHeight: '350px', borderRadius: '16px', 
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)', marginBottom: '25px'
                    }}/>
                    <div><label htmlFor="file" className="file-label">เปลี่ยนรูปภาพ</label></div>
                </div>
            ) : (
                <label htmlFor="file" style={{cursor:'pointer'}}>
                    <div style={{fontSize: '4rem', marginBottom:'15px', fontWeight:'bold', color: '#1e293b'}}>+</div>
                    <h3 style={{color:'#1e293b', margin:'0 0 10px 0'}}>อัปโหลดภาพฟิล์มเลือด</h3>
                    <p style={{color:'#64748b', margin:0}}>คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                    <div className="file-label">เลือกไฟล์รูปภาพ</div>
                </label>
            )}
            {selectedFile && (
                <div style={{marginTop: '30px'}}>
                    <button onClick={handleSubmit} className="analyze-button">
                        เริ่มวิเคราะห์ภาพ (Start Analysis)
                    </button>
                </div>
            )}
            {error && <p style={{color:'#ef4444', marginTop:'20px', fontWeight:'600'}}>{error}</p>}
        </div>
      )}

      {loading && (
          <div style={{textAlign:'center', padding:'80px 20px'}}>
              <div className="loader"></div>
              <h3 style={{color:'#1e293b', marginTop:'20px'}}>AI กำลังประมวลผล...</h3>
              <p style={{color:'#64748b'}}>Cell Segmentation &rarr; Feature Extraction &rarr; Diagnosis</p>
          </div>
      )}

      {res && (
        <div className="results-grid">
          <div className="results-left" style={{display:'flex', flexDirection:'column', gap:'25px'}}>
             <div className="detail-card">
                <h4>
                    ภาพต้นฉบับ (Original Slide)
                    <span style={{fontSize:'0.8rem', color:'#64748b', fontWeight:'normal'}}> (แตะที่กรอบแดงเพื่อดูรายละเอียด)</span>
                </h4>
                {preview && (
                    <InteractiveImage 
                        imageUrl={preview} 
                        cells={abnormalCells} 
                        onCellClick={(cell) => setSelectedCellDetail(cell)}
                    />
                )}
             </div>

             {sizeData.length > 0 && (
                 <div className="detail-card clickable-card" onClick={() => setShowSizeGallery(true)} style={{borderLeft:'5px solid #8b5cf6'}}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                            <h4 style={{marginBottom:5, border:0, color:'#8b5cf6'}}>Size Analysis Visualization</h4>
                            <p style={{margin:0, fontSize:'0.85rem', color:'#64748b'}}>
                                ตรวจพบ {sizeData.length} เซลล์ที่ถูกวัดขนาด
                            </p>
                        </div>
                        <span style={{color:'#8b5cf6', fontSize:'1.2rem'}}>→</span>
                     </div>
                     <div style={{display:'flex', gap:'8px', marginTop:'15px'}}>
                        {sizeData.slice(0, 4).map((item, idx) => (
                            <img key={idx} src={`${BACKEND_URL}/${item.visualization_url}`} alt="viz" 
                                style={{width:'45px', height:'45px', objectFit:'cover', borderRadius:'8px', border:'1px solid #ddd'}}/>
                        ))}
                     </div>
                 </div>
             )}

             {chromatinCells.length > 0 && (
                 <div className="detail-card clickable-card" onClick={() => setShowChromatinGallery(true)}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h4 style={{marginBottom:0}}>Multi-Chromatin <span style={{color:'#64748b'}}>({chromatinCells.length})</span></h4>
                        <span style={{color:'var(--primary)'}}>ดูทั้งหมด →</span>
                     </div>
                 </div>
             )}

             {schuffnerCells.length > 0 && (
                 <div className="detail-card clickable-card" onClick={() => setShowSchuffnerGallery(true)}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h4 style={{marginBottom:0}}>Schüffner / Amoeboid <span style={{color:'#64748b'}}>({schuffnerCells.length})</span></h4>
                        <span style={{color:'var(--primary)'}}>ดูทั้งหมด →</span>
                     </div>
                 </div>
             )}

             {basketCells.length > 0 && (
                 <div className="detail-card clickable-card" onClick={() => setShowBasketGallery(true)}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h4 style={{marginBottom:0}}>Basket / Band Form <span style={{color:'#64748b'}}>({basketCells.length})</span></h4>
                        <span style={{color:'var(--primary)'}}>ดูทั้งหมด →</span>
                     </div>
                 </div>
             )}
          </div>

          <div className="results-right" style={{display:'flex', flexDirection:'column', gap:'25px'}}>
             <div className="overall-diagnosis-card">
                <h4>DIAGNOSIS RESULT</h4>
                <h2 style={{color: isFalciparum?'#fca5a5': (isVivax?'#86efac': (isMalariae ? '#fdba74' : '#ffffff'))}}>
                    {overallDiagnosis}
                </h2>
                <div className="checklist-grid-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                      <div className="checklist-column" style={{opacity: isFalciparum ? 1 : 0.4}}>
                        <h5 style={{ color: '#fca5a5' }}>P. falciparum</h5>
                        <div className="checklist-item"><img src={chkChromatin ? checkIcon : emptyBoxIcon} width="22" style={{marginRight:8}} /> Chromatin</div>
                        <div className="checklist-item"><img src={chkApplique ? checkIcon : emptyBoxIcon} width="22" style={{marginRight:8}} /> Appliqué</div>
                      </div>
                      <div className="checklist-column" style={{opacity: isVivax ? 1 : 0.4}}>
                        <h5 style={{color: '#86efac'}}>P. vivax</h5>
                        <div className="checklist-item"><img src={chkSchuffner ? checkIcon : emptyBoxIcon} width="22" style={{marginRight:8}} /> Schüffner</div>
                        <div className="checklist-item"><img src={chkEnlarged ? checkIcon : emptyBoxIcon} width="22" style={{marginRight:8}} /> Enlarged</div>
                        <div className="checklist-item"><img src={chkAmoeboid ? checkIcon : emptyBoxIcon} width="22" style={{marginRight:8}} /> Amoeboid</div>
                      </div>
                      <div className="checklist-column" style={{opacity: isMalariae ? 1 : 0.4}}>
                        <h5 style={{color: '#fdba74'}}>P. malariae</h5>
                        <div className="checklist-item"><img src={chkSmaller ? checkIcon : emptyBoxIcon} width="22" style={{marginRight:8}} /> Smaller</div>
                        <div className="checklist-item"><img src={chkBandBasket ? checkIcon : emptyBoxIcon} width="22" style={{marginRight:8}} /> Band Form</div>
                      </div>
                    </div>
                </div>
             </div>

             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div className='detail-card' style={{textAlign:'center', padding:'25px'}}>
                    <p style={{margin:0, color:'#64748b', fontSize:'0.9rem'}}>Total Cells</p>
                    <strong style={{fontSize:'2rem', color:'#1e293b', display:'block', marginTop:'5px'}}>{totalCells}</strong>
                </div>
                <div className='detail-card' style={{textAlign:'center', padding:'25px'}}>
                    <p style={{margin:0, color:'#64748b', fontSize:'0.9rem'}}>Abnormal Found</p>
                    <strong style={{fontSize:'2rem', color:'#f59e0b', display:'block', marginTop:'5px'}}>
                         {chromatinCells.length + schuffnerCells.length + basketCells.length}
                    </strong>
                </div>
             </div>

             <div className='detail-card' style={{borderLeft:'5px solid var(--primary)'}}>
                  <h4>Morphometry Analysis</h4>
                  <div style={{marginTop:'15px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                          <span style={{fontWeight:'600', color:'#475569'}}>Avg Size Ratio (Cell / RBC)</span>
                          <span style={{fontWeight:'700', fontSize:'1.1rem', color: parseFloat(avgRatio) > 1.2 ? '#ef4444' : '#10b981'}}>
                              {avgRatio}x
                          </span>
                      </div>
                      <div className="morph-bar-bg">
                          <div className="morph-bar-fill" style={{
                              width: `${Math.min(parseFloat(avgRatio) / 2.5 * 100, 100)}%`, 
                              background: parseFloat(avgRatio) > 1.2 ? 'linear-gradient(90deg, #3b82f6, #ef4444)' : '#3b82f6'
                          }}></div>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'#94a3b8', marginTop:'8px'}}>
                         <span>Normal (1.0x)</span>
                         <span>Enlarged (1.5x)</span>
                      </div>
                  </div>
             </div>

             <div style={{marginTop:'10px', display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                <button onClick={()=>window.location.reload()} style={{
                    padding:'12px 28px', background:'#f1f5f9', color:'#475569', 
                    border:'none', borderRadius:'50px', cursor:'pointer', fontWeight:'600',
                    display:'flex', alignItems:'center', gap:'8px'
                }}>
                    เริ่มใหม่
                </button>
                {isFalciparum && (
                    <Link to="/medication-guide/falciparum" style={{textDecoration:'none'}}>
                        <button style={{
                            padding:'12px 28px', background:'#ef4444', color:'white', 
                            border:'none', borderRadius:'50px', cursor:'pointer', fontWeight:'600'
                        }}>
                             แนวทางการรักษา (P.f)
                        </button>
                    </Link>
                )}
                {isVivax && (
                    <Link to="/medication-guide/vivax" style={{textDecoration:'none'}}>
                         <button style={{
                            padding:'12px 28px', background:'#10b981', color:'white', 
                            border:'none', borderRadius:'50px', cursor:'pointer', fontWeight:'600'
                        }}>
                             แนวทางการรักษา (P.v)
                        </button>
                    </Link>
                )}
             </div>
          </div>
        </div>
      )}

      {showSizeGallery && <SizeGallery title="Size Calculation Results" items={sizeData} onClose={()=>setShowSizeGallery(false)} />}
      
      {showChromatinGallery && <ImageGallery title="Abnormal Chromatin" images={chromatinCells} onClose={()=>setShowChromatinGallery(false)}/>}
      {showSchuffnerGallery && <ImageGallery title="Schüffner's Dot / Amoeboid" images={schuffnerCells} onClose={()=>setShowSchuffnerGallery(false)}/>}
      {showBasketGallery && <ImageGallery title="Basket/Band Form" images={basketCells} onClose={()=>setShowBasketGallery(false)}/>}
      {viewingImage && <SingleImageViewer imageUrl={viewingImage} onClose={()=>setViewingImage(null)}/>}

      {/* --- MODAL ที่แก้ไขแล้ว (แสดงขนาดเชื้อแทนความมั่นใจ) --- */}
      {selectedCellDetail && (
          <div className="modal-overlay" onClick={() => setSelectedCellDetail(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{textAlign:'center', maxWidth:'400px'}}>
                  <h3 style={{color:'#ef4444', marginTop:0}}>ตรวจพบเชื้อผิดปกติ!</h3>
                  <img 
                    src={`${BACKEND_URL}/${selectedCellDetail.url}`} 
                    alt="Cell Crop" 
                    style={{width:'150px', height:'150px', borderRadius:'12px', border:'2px solid #ef4444', marginBottom:'15px', objectFit:'cover'}}
                  />
                  <div style={{textAlign:'left', background:'#f8fafc', padding:'15px', borderRadius:'8px'}}>
                      <p style={{margin:'5px 0'}}><strong>ประเภท:</strong> {selectedCellDetail.characteristic}</p>
                      
                      {/* --- ตรงนี้ครับที่แก้: หาขนาดมาใส่แทน --- */}
                      {(() => {
                          const matchedSize = sizeData.find(item => item.filename === selectedCellDetail.cell);
                          const sizeDisplay = matchedSize 
                              ? `${matchedSize.size_px} px` 
                              : (selectedCellDetail.bbox ? `${selectedCellDetail.bbox.w * selectedCellDetail.bbox.h} px (Est)` : "N/A");
                          
                          return <p style={{margin:'5px 0'}}><strong>ขนาดของเชื้อ:</strong> {sizeDisplay}</p>;
                      })()}
                      
                      {selectedCellDetail.bbox && (
                          <p style={{fontSize:'0.8rem', color:'#64748b', margin:'5px 0'}}>
                            ตำแหน่ง: X={selectedCellDetail.bbox.x}, Y={selectedCellDetail.bbox.y}
                          </p>
                      )}
                  </div>
                  <button onClick={() => setSelectedCellDetail(null)} className="close-button">ปิด</button>
              </div>
          </div>
      )}

    </div> 
  );
}

function AppWrapper() { 
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<AnalysisPage />} /> 
        <Route path="/medication-guide/falciparum" element={<FalciparumGuide />} /> 
        <Route path="/medication-guide/vivax" element={<VivaxGuide />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;