import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FalciparumGuide.css'; // ใช้ CSS สำหรับหน้านี้โดยเฉพาะ

// --- (แก้แล้ว) Import รูปภาพยาจากโฟลเดอร์ assets ---
import dhaPipImage from './assets/eurartesim.png';
import primaquineImage from './assets/Primaquine.png';

function FalciparumGuide() {
  const navigate = useNavigate();

  return (
    <div className="medication-guide-page">
      <header className="guide-header">
        {/* ปรับ Title ให้ตรงสไลด์ */}
        <h1 className="guide-title">การให้ยารักษาผู้ป่วย: <i>P. falciparum</i></h1>
        <p className="guide-subtitle">
          (กรณีที่ไม่มีภาวะแทรกซ้อน และพื้นที่ไม่พบการดื้อยา)
        </p>
      </header>

      {/* --- ส่วนคำเตือน (ยังคงไว้) --- */}
      <div className="disclaimer-section">
        <div className="disclaimer-card">
          <h4 className="disclaimer-title">⚠️ คำเตือนสำคัญทางการแพทย์</h4>
          <p className="disclaimer-text">
            ข้อมูลนี้เป็นเพียงข้อมูลสรุปตัวอย่าง **ไม่ถือเป็นคำแนะนำทางการแพทย์**
            การรักษามาลาเรียมีความซับซ้อนสูง และต้องอยู่ภายใต้การดูแลของแพทย์เท่านั้น
            **ห้ามซื้อยารับประทานเองโดยเด็ดขาด**
          </p>
        </div>
      </div>

      {/* --- หัวข้อสูตรยาที่แนะนำ --- */}
      <h2 className="regimen-title">สูตรยาที่ใช้รักษา (Recommended Regimen)</h2>
      
      {/* --- กล่องแสดงยาสูตรผสม --- */}
      <div className="regimen-combo-box">
        {/* --- ยาตัวที่ 1 --- */}
        <div className="combo-item">
          <img src={dhaPipImage} alt="Dihydroartemisinin-Piperaquine" className="combo-image" />
          <h4 className="combo-name">Dihydroartemisinin-Piperaquine (DHA-PIP)</h4>
          <p>(Fixed-dose Combination)</p>
        </div>

        {/* --- เครื่องหมายบวก --- */}
        <div className="combo-plus">
          <span>+</span>
        </div>

        {/* --- ยาตัวที่ 2 --- */}
        <div className="combo-item">
          <img src={primaquineImage} alt="Primaquine" className="combo-image" />
          <h4 className="combo-name">Primaquine</h4>
          <p>(Single Dose)</p>
        </div>
      </div>

      {/* --- ตารางการบริหารยา --- */}
      <h2 className="regimen-title">การบริหารยา (Administration)</h2>
      
      <div className="table-wrapper">
        <table className="medication-table">
          <thead>
            <tr>
              {/* หัวตารางตามสไลด์ */}
              <th>วันนับจากวันที่เริ่มรักษา</th>
              <th>Day 0 (เริ่ม)</th>
              <th>Day 1</th>
              <th>Day 2</th>
            </tr>
          </thead>
          <tbody>
            {/* --- แถว DHA-PIP --- */}
            <tr>
              <td>
                <strong>Dihydroartemisinin-Piperaquine</strong>
                <br/>
                <span className="table-note">(ควรรับประทานในเวลาเดียวกันทุกวัน)</span>
              </td>
              <td>1 ครั้ง</td>
              <td>1 ครั้ง</td>
              <td>1 ครั้ง</td>
            </tr>
            {/* --- แถว Primaquine --- */}
            <tr>
              <td>
                <strong>Primaquine</strong>
              </td>
              <td colSpan="3" className="primaquine-dose">
                <strong>1 ครั้ง ในวันใดวันหนึ่ง</strong>
                <br/>
                <span className="table-note">(โดยพิจารณาอาการผู้ป่วยว่าสามารถรับประทานยาได้ ไม่คลื่นไส้อาเจียน)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* --- ปุ่มกลับ --- */}
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; กลับไปหน้าผลการวิเคราะห์
        </button>
      </div>
    </div>
  );
}

export default FalciparumGuide;