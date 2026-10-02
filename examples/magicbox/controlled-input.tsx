import { useState } from 'react';
import { MagicBox } from '@minifield-labs/magicbox';
import type { MagicBoxExtractor } from '@minifield-labs/magicbox';
import '@minifield-labs/magicbox/styles.css';

export function ControlledInput({
  extract,
}: {
  extract: MagicBoxExtractor;
}) {
  const [text, setText] = useState('');

  return (
    <MagicBox
      value={text}
      onValueChange={setText}
      onExtract={extract}
      name="source"
      rows={8}
      maxLength={12000}
    />
  );
}
