const ACKResponse = async (res) => {
  return {
    context: res.context,
    message: `ACK`,
    data: res.message,
  };
};

const NACKResponse = async (res) => {
  return {
    message: `NACK`,
    data: res.message,
  };
};

const ErrResponse = async (error) => {
  return {
    status: error.response.status,
    message: `NACK`,
    data: error.response.data.message,
  };
};

const BecknErrResponse = async (res, err_message, err_code) => {
  return res.status(res.status).json({
    context: context,
    message: {
      status: "NACK",
    },
    error: {
      description: err_message,
      type: "JSON_SCHEMA_ERROR",
      code: err_code,
    },
  });
};
module.exports = { ACKResponse, NACKResponse, ErrResponse, BecknErrResponse };
