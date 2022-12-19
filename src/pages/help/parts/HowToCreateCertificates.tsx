import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { TextareaComponent } from "../../../components/TextareaComponent";

const description = [
  {
    label: "creating self signed certificate using windows",
    content: "Replace concrete names with your names.",
  },
  {
    label: "source",
    content:
      "https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/",
  },

  {
    label:
      "using openSSL from GIT installation (replace <openssl> with concrete path to openssl.exe)",
    content: "openssl = 'C:/Program Files/Git/usr/bin/openssl.exe'",
  },

  { label: "creating root certificate" },
  { label: "step 1", content: "openssl genrsa -des3 -out myCA.key 2048" },

  {
    label: "step 2",
    content:
      "openssl req -x509 -new -nodes -key myCA.key -sha256 -days 360 -out myCA.pem",
  },

  { label: "creating certificate for a host" },
  { label: "step 1", content: "openssl genrsa -out DESKTOP-61MUS1J.key 2048" },

  {
    label: "step 2",
    content:
      "openssl req -new -key DESKTOP-61MUS1J.key -out DESKTOP-61MUS1J.csr",
  },

  {
    label: "step 3",
    content:
      "openssl x509 -req -in DESKTOP-61MUS1J.csr -CA myCA.pem -CAkey myCA.key -CAcreateserial -out DESKTOP-61MUS1J.crt -days 360 -sha256 -extfile DESKTOP-61MUS1J.ext",
  },
  {
    label: "converting certificate to (for windows)",
    content: "openssl pkcs12 -in myCA.pem -export -nokeys -out myCA.pfx",
  },
];

export const HowToCreateCertificates = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <Grid container direction="column">
      <Grid item>
        <Paper>
          <Typography component="span" variant="h6">
            {"Creating certificates"}
          </Typography>
          <IconButton onClick={() => setIsDetailsOpen((previous) => !previous)}>
            <MoreHorizIcon />
          </IconButton>
        </Paper>
      </Grid>
      {isDetailsOpen && (
        <Grid item>
          <TextareaComponent
            value={description}
            formatObject
            maxRows={15}
            style={{
              width: "90%",
              resize: "none",
              marginRight: 30,
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};
