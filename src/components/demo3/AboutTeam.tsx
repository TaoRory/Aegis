import Image from "next/image";

import type { D3Dict } from "@/content/demo3";

import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";

/**
 * Ban giám đốc (trang Giới thiệu): bốn thẻ chân dung. Mọi chữ (tên, chức danh) nằm dưới ảnh trên nền sáng nên luôn đọc rõ,
 * không đè lên ảnh. Thẻ trồi lên so le theo thứ tự; rê chuột (chỉ máy có chuột): ảnh nhích gần hơn trong khung và chữ viết tắt
 * chức danh đổi sang Aqua. Chưa có ảnh: hiện ô chữ cái đầu cùng tỉ lệ khung, để lúc bổ sung ảnh trang không xô lệch.
 * Giới thiệu ngắn chỉ hiện khi đã có nội dung (member.bio).
 */
export function AboutTeam({ t }: { t: D3Dict }) {
  const { team } = t.x.about;
  return (
    <section className="d2-wrap d2-section" aria-labelledby="d3-team-title">
      <p className="d2-small font-semibold text-muted">{team.label}</p>
      <SplitReveal as="h2" id="d3-team-title" className="d2-h2 d3-lines mt-3 max-w-[16em]">
        {team.title}
      </SplitReveal>
      <ul className="d3-team">
        {team.members.map((member, index) => (
          <Rise as="li" key={member.id} kind="pop" index={index} className="d3-member">
            <div className="d3-member-photo" data-empty={member.photo ? undefined : "true"}>
              {member.photo ? (
                <Image src={member.photo.src} alt={member.name} width={member.photo.width} height={member.photo.height} sizes="(min-width: 64rem) 20vw, (min-width: 40rem) 40vw, 90vw" />
              ) : (
                <span aria-hidden>{member.initials}</span>
              )}
            </div>
            <div className="d3-member-text">
              <p className="d3-member-short" aria-hidden>
                {member.short}
              </p>
              <h3 className="d2-h3">{member.name}</h3>
              <p className="d3-member-role">{member.role}</p>
              {member.bio && <p className="d3-member-bio">{member.bio}</p>}
            </div>
          </Rise>
        ))}
      </ul>
    </section>
  );
}
