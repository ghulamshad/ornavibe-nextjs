'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';

export type PrimaryButtonProps = ButtonProps;

export default function PrimaryButton(props: PrimaryButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      size={props.size ?? 'medium'}
      {...props}
    />
  );
}

