import React from 'react';

type Props = {
  port: string;
};

const PortSvg: React.FC<Props> = ({ port }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="port-svg6348"
    viewBox="0 0 49.96 58.93"
    // width="50.28571428571429"
    // height="59.31419421251287"
  >
    <g id="port-icn_port" data-name="icn port">
      <path
        id="port-port_2"
        data-name="port 2"
        d="M4.48 0h50v58.93h-50z"
        transform="translate(-4.48)"
        fill="#eaeaea"
      />
      <path
        id="port-port_1"
        data-name="port 1"
        d="M9.74 46.49V18.66h17.11v-6.91h4.72V2.59h12.92v8.82h5.06v35.08h-8v7.43H38.9v-7.51h-2v7.5h-2.19v-7.5h-2.16v7.5h-2.1v-7.5H28.6v7.5h-2.1v-7.5h-1.82v7.5h-2.46v-7.5h-1.68v7.5H18v-7.45z"
        transform="translate(-4.48)"
        fill="#a8aaa8"
      />
      <g id="port-text10060" style={{ isolation: 'isolate' }}>
        <text
          id="port-port_text"
          transform="translate(22.21 40.2)"
          style={{ isolation: 'isolate', userSelect: 'none' }}
          fontSize="16"
          fill="#fff"
          fontFamily="ArialMT,Arial"
        >
          {port}
        </text>
      </g>
    </g>
  </svg>
);

export default PortSvg;
